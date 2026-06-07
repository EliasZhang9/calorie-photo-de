"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import type { CreateMealLogInput, MealLogRecord } from "@/lib/meal-log";

type MealLogErrorResponse = {
  error?: string;
};

async function getMealLogErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as MealLogErrorResponse;

    if (typeof payload.error === "string" && payload.error.length > 0) {
      return payload.error;
    }
  } catch {
    // Ignore JSON parsing failures and fall back to a generic message.
  }

  return "Meal log save failed.";
}

export async function createMealLog(input: CreateMealLogInput) {
  const session = await fetchAuthSession();
  const accessToken = session.tokens?.accessToken?.toString();
  const idToken = session.tokens?.idToken?.toString();

  if (!accessToken || !idToken) {
    throw new Error("You must be signed in to save a meal log.");
  }

  const response = await fetch("/api/meals", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "x-id-token": idToken,
    },
    body: JSON.stringify({
      imageKey: input.imageKey,
      status: input.status ?? "uploaded",
      caloriesMin: input.caloriesMin,
      caloriesMax: input.caloriesMax,
      confidence: input.confidence,
      title: input.title,
      notes: input.notes,
    }),
  });

  if (!response.ok) {
    throw new Error(await getMealLogErrorMessage(response));
  }

  return (await response.json()) as MealLogRecord;
}
