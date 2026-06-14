import { afterEach, describe, expect, it, vi } from "vitest";

const configureMock = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify", () => ({
  Amplify: {
    configure: configureMock,
  },
}));

async function loadModule() {
  return import("./amplify-auth-config");
}

describe("amplify auth config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    configureMock.mockReset();
  });

  it("reports auth, storage, and complete config as false when env vars are missing", async () => {
    const config = await loadModule();

    expect(config.hasAmplifyAuthConfig()).toBe(false);
    expect(config.hasAmplifyStorageConfig()).toBe(false);
    expect(config.hasCompleteAmplifyConfig()).toBe(false);
    expect(config.hasPartialAmplifyConfig()).toBe(false);
  });

  it("does not configure Amplify when env vars are missing", async () => {
    const config = await loadModule();

    config.configureAmplifyAuth();

    expect(configureMock).not.toHaveBeenCalled();
  });

  it("reports complete config only when both auth and storage env vars exist", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "pool-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID", "identity-id");
    vi.stubEnv("NEXT_PUBLIC_S3_BUCKET", "bucket-name");
    vi.stubEnv("NEXT_PUBLIC_S3_REGION", "eu-central-1");

    const config = await loadModule();

    expect(config.hasAmplifyAuthConfig()).toBe(true);
    expect(config.hasAmplifyStorageConfig()).toBe(true);
    expect(config.hasCompleteAmplifyConfig()).toBe(true);
    expect(config.hasPartialAmplifyConfig()).toBe(false);
  });

  it("reports partial config when only auth env vars exist", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "pool-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");

    const config = await loadModule();

    expect(config.hasAmplifyAuthConfig()).toBe(true);
    expect(config.hasAmplifyStorageConfig()).toBe(false);
    expect(config.hasCompleteAmplifyConfig()).toBe(false);
    expect(config.hasPartialAmplifyConfig()).toBe(true);
  });

  it("does not configure Amplify when only auth env vars exist", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "pool-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");

    const config = await loadModule();

    config.configureAmplifyAuth();

    expect(configureMock).not.toHaveBeenCalled();
  });

  it("configures Amplify with Cognito and S3 when all env vars are present", async () => {
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "pool-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID", "client-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID", "identity-id");
    vi.stubEnv("NEXT_PUBLIC_S3_BUCKET", "bucket-name");
    vi.stubEnv("NEXT_PUBLIC_S3_REGION", "eu-central-1");

    const config = await loadModule();

    config.configureAmplifyAuth();

    expect(configureMock).toHaveBeenCalledWith(
      {
        Auth: {
          Cognito: {
            userPoolId: "pool-id",
            userPoolClientId: "client-id",
            identityPoolId: "identity-id",
            loginWith: {
              email: true,
            },
          },
        },
        Storage: {
          S3: {
            bucket: "bucket-name",
            region: "eu-central-1",
          },
        },
      },
      { ssr: true },
    );
  });
});
