import { randomUUID } from "node:crypto";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { verifyMealLogAccessToken } from "@/lib/cognito-auth";
import {
  getDynamoDbDocumentClient,
  getMealLogsTableName,
} from "@/lib/dynamodb";
import {
  isMealLogStatus,
  type CreateMealLogInput,
  type MealLogRecord,
} from "@/lib/meal-log";

export const runtime = "nodejs";

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isOptionalInteger(value: unknown) {
  return (
    value === undefined ||
    (typeof value === "number" && Number.isInteger(value) && value >= 0)
  );
}

function validateCreateMealLogInput(
  value: unknown,
): { ok: true; data: CreateMealLogInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const input = value as Record<string, unknown>;

  if (typeof input.imageKey !== "string" || input.imageKey.trim() === "") {
    return { ok: false, error: "imageKey is required." };
  }

  if (input.status !== undefined && !isMealLogStatus(input.status)) {
    return { ok: false, error: "status must be a valid MealLog status." };
  }

  if (!isOptionalInteger(input.caloriesMin)) {
    return { ok: false, error: "caloriesMin must be a non-negative integer." };
  }

  if (!isOptionalInteger(input.caloriesMax)) {
    return { ok: false, error: "caloriesMax must be a non-negative integer." };
  }

  if (!isOptionalString(input.confidence)) {
    return { ok: false, error: "confidence must be a string." };
  }

  if (!isOptionalString(input.title)) {
    return { ok: false, error: "title must be a string." };
  }

  if (!isOptionalString(input.notes)) {
    return { ok: false, error: "notes must be a string." };
  }

  if (
    Number.isInteger(input.caloriesMin) &&
    Number.isInteger(input.caloriesMax) &&
    (input.caloriesMax as number) < (input.caloriesMin as number)
  ) {
    return {
      ok: false,
      error: "caloriesMax must be greater than or equal to caloriesMin.",
    };
  }

  return {
    ok: true,
    data: {
      imageKey: input.imageKey.trim(),
      status: input.status,
      caloriesMin: input.caloriesMin as number | undefined,
      caloriesMax: input.caloriesMax as number | undefined,
      confidence: input.confidence as string | undefined,
      title: input.title as string | undefined,
      notes: input.notes as string | undefined,
    },
  };
}

export async function POST(request: Request) {
  let authenticatedUser: Awaited<ReturnType<typeof verifyMealLogAccessToken>>;

  try {
    authenticatedUser = await verifyMealLogAccessToken(
      request.headers.get("authorization"),
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const idToken = request.headers.get("x-id-token");

  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validation = validateCreateMealLogInput(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const createdAt = new Date().toISOString();
  const mealLog: MealLogRecord = {
    id: randomUUID(),
    userSub: authenticatedUser.sub,
    userName: authenticatedUser.userName,
    imageKey: validation.data.imageKey,
    status: validation.data.status ?? "uploaded",
    createdAt,
  };

  if (validation.data.caloriesMin !== undefined) {
    mealLog.caloriesMin = validation.data.caloriesMin;
  }

  if (validation.data.caloriesMax !== undefined) {
    mealLog.caloriesMax = validation.data.caloriesMax;
  }

  if (validation.data.confidence !== undefined) {
    mealLog.confidence = validation.data.confidence;
  }

  if (validation.data.title !== undefined) {
    mealLog.title = validation.data.title;
  }

  if (validation.data.notes !== undefined) {
    mealLog.notes = validation.data.notes;
  }

  await getDynamoDbDocumentClient({
    idToken,
  }).send(
    new PutCommand({
      TableName: getMealLogsTableName(),
      Item: mealLog,
      ConditionExpression: "attribute_not_exists(id)",
    }),
  );

  return NextResponse.json(mealLog, { status: 201 });
}
