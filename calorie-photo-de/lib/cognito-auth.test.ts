import { afterEach, describe, expect, it, vi } from "vitest";

const verifyMock = vi.hoisted(() => vi.fn());
const createVerifierMock = vi.hoisted(() =>
  vi.fn(() => ({
    verify: verifyMock,
  })),
);

vi.mock("aws-jwt-verify", () => ({
  CognitoJwtVerifier: {
    create: createVerifierMock,
  },
}));

async function loadModule() {
  return import("./cognito-auth");
}

describe("cognito auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    createVerifierMock.mockClear();
    verifyMock.mockReset();
  });

  it("verifies a bearer token with the configured Cognito user pool", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "eu-central-1_demo");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");
    verifyMock.mockResolvedValue({
      sub: "user-sub-123",
    });

    const auth = await loadModule();
    const result = await auth.verifyMealLogAccessToken("Bearer access-token");

    expect(result).toEqual({
      accessToken: "access-token",
      sub: "user-sub-123",
    });
    expect(createVerifierMock).toHaveBeenCalledWith({
      userPoolId: "eu-central-1_demo",
      tokenUse: "access",
      clientId: "client-id",
    });
    expect(verifyMock).toHaveBeenCalledWith("access-token");
  });

  it("rejects missing bearer headers before verification", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "eu-central-1_demo");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");

    const auth = await loadModule();

    await expect(auth.verifyMealLogAccessToken(null)).rejects.toThrow(
      "Missing Authorization header.",
    );
    expect(createVerifierMock).not.toHaveBeenCalled();
  });

  it("throws when the Cognito user pool env var is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");

    const auth = await loadModule();

    await expect(
      auth.verifyMealLogAccessToken("Bearer access-token"),
    ).rejects.toThrow("Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID environment variable.");
  });

  it("surfaces token verification failures", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "eu-central-1_demo");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");
    verifyMock.mockRejectedValue(new Error("Token expired"));

    const auth = await loadModule();

    await expect(
      auth.verifyMealLogAccessToken("Bearer expired-token"),
    ).rejects.toThrow("Token expired");
  });
});
