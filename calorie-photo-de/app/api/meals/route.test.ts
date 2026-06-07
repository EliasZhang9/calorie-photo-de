import { afterEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.hoisted(() => vi.fn());
const verifyMealLogAccessTokenMock = vi.hoisted(() => vi.fn());
const getMealLogsTableNameMock = vi.hoisted(() => vi.fn(() => "meal-logs"));
const randomUuidMock = vi.hoisted(() => vi.fn(() => "meal-log-id"));

vi.mock("node:crypto", () => ({
  randomUUID: randomUuidMock,
}));

vi.mock("@/lib/cognito-auth", () => ({
  verifyMealLogAccessToken: verifyMealLogAccessTokenMock,
}));

vi.mock("@/lib/dynamodb", () => ({
  getDynamoDbDocumentClient: () => ({
    send: sendMock,
  }),
  getMealLogsTableName: getMealLogsTableNameMock,
}));

async function loadModule() {
  return import("./route");
}

describe("POST /api/meals", () => {
  afterEach(() => {
    vi.resetModules();
    sendMock.mockReset();
    verifyMealLogAccessTokenMock.mockReset();
    getMealLogsTableNameMock.mockClear();
    randomUuidMock.mockClear();
  });

  it("writes a meal log for the authenticated Cognito user", async () => {
    verifyMealLogAccessTokenMock.mockResolvedValue({
      accessToken: "access-token",
      sub: "user-sub-123",
    });
    sendMock.mockResolvedValue(undefined);

    const { POST } = await loadModule();
    const request = new Request("http://localhost/api/meals", {
      method: "POST",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json",
        "x-id-token": "id-token",
      },
      body: JSON.stringify({
        userName: "spoofed-user",
        imageKey: "private/id#demo-user/food-images/example.jpg",
        status: "uploaded",
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as Record<string, unknown>;
    const command = sendMock.mock.calls[0][0] as {
      input: Record<string, unknown>;
    };
    const item = command.input.Item as Record<string, unknown>;

    expect(response.status).toBe(201);
    expect(body.userName).toBe("user-sub-123");
    expect(body.imageKey).toBe("private/id#demo-user/food-images/example.jpg");
    expect(item.userName).toBe("user-sub-123");
    expect(command.input.TableName).toBe("meal-logs");
    expect(verifyMealLogAccessTokenMock).toHaveBeenCalledWith(
      "Bearer access-token",
    );
  });

  it("rejects unauthorized requests", async () => {
    verifyMealLogAccessTokenMock.mockRejectedValue(new Error("Token expired"));

    const { POST } = await loadModule();
    const request = new Request("http://localhost/api/meals", {
      method: "POST",
      body: JSON.stringify({
        imageKey: "private/id#demo-user/food-images/example.jpg",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads", async () => {
    verifyMealLogAccessTokenMock.mockResolvedValue({
      accessToken: "access-token",
      sub: "user-sub-123",
    });

    const { POST } = await loadModule();
    const request = new Request("http://localhost/api/meals", {
      method: "POST",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json",
        "x-id-token": "id-token",
      },
      body: JSON.stringify({
        imageKey: "private/id#demo-user/food-images/example.jpg",
        caloriesMin: 500,
        caloriesMax: 200,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "caloriesMax must be greater than or equal to caloriesMin.",
    });
    expect(sendMock).not.toHaveBeenCalled();
  });
});
