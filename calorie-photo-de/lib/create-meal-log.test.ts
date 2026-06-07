import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthSessionMock = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: fetchAuthSessionMock,
}));

async function loadModule() {
  return import("./create-meal-log");
}

describe("createMealLog", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    fetchAuthSessionMock.mockReset();
    fetchMock.mockReset();
  });

  it("posts a meal log with the current Cognito tokens", async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: {
        accessToken: {
          toString: () => "access-token",
        },
        idToken: {
          toString: () => "id-token",
        },
      },
    });
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "meal-log-id",
          userName: "user-sub-123",
          imageKey: "private/id#demo-user/food-images/example.jpg",
          status: "uploaded",
          createdAt: "2026-06-07T00:00:00.000Z",
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const mealLogs = await loadModule();

    await mealLogs.createMealLog({
      imageKey: "private/id#demo-user/food-images/example.jpg",
      status: "uploaded",
    });

    expect(fetchAuthSessionMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith("/api/meals", {
      method: "POST",
      headers: {
        Authorization: "Bearer access-token",
        "Content-Type": "application/json",
        "x-id-token": "id-token",
      },
      body: JSON.stringify({
        imageKey: "private/id#demo-user/food-images/example.jpg",
        status: "uploaded",
        caloriesMin: undefined,
        caloriesMax: undefined,
        confidence: undefined,
        title: undefined,
        notes: undefined,
      }),
    });
  });

  it("throws a clear error when the user is not signed in", async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: undefined,
    });

    const mealLogs = await loadModule();

    await expect(
      mealLogs.createMealLog({
        imageKey: "private/id#demo-user/food-images/example.jpg",
      }),
    ).rejects.toThrow("You must be signed in to save a meal log.");
  });

  it("surfaces API error responses", async () => {
    fetchAuthSessionMock.mockResolvedValue({
      tokens: {
        accessToken: {
          toString: () => "access-token",
        },
        idToken: {
          toString: () => "id-token",
        },
      },
    });
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    const mealLogs = await loadModule();

    await expect(
      mealLogs.createMealLog({
        imageKey: "private/id#demo-user/food-images/example.jpg",
      }),
    ).rejects.toThrow("Unauthorized.");
  });
});
