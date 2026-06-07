import { afterEach, describe, expect, it, vi } from "vitest";

const dynamoDbClientMock = vi.hoisted(() => vi.fn());
const fromCognitoIdentityPoolMock = vi.hoisted(() => vi.fn());
const fromDocumentClientMock = vi.hoisted(() => vi.fn());

vi.mock("@aws-sdk/client-dynamodb", () => ({
  DynamoDBClient: dynamoDbClientMock,
}));

vi.mock("@aws-sdk/credential-provider-cognito-identity", () => ({
  fromCognitoIdentityPool: fromCognitoIdentityPoolMock,
}));

vi.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocumentClient: {
    from: fromDocumentClientMock,
  },
}));

async function loadModule() {
  return import("./dynamodb");
}

describe("dynamodb helper", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    dynamoDbClientMock.mockReset();
    fromCognitoIdentityPoolMock.mockReset();
    fromDocumentClientMock.mockReset();
  });

  it("creates a DynamoDB document client from Cognito identity credentials", async () => {
    vi.stubEnv("AWS_REGION", "eu-central-1");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID", "eu-central-1:pool-id");
    vi.stubEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID", "eu-central-1_abc123");

    dynamoDbClientMock.mockImplementation(function mockDynamoDbClient(
      this: { config?: unknown },
      config,
    ) {
      this.config = config;
    });
    fromCognitoIdentityPoolMock.mockReturnValue("credential-provider");
    fromDocumentClientMock.mockImplementation((client) => ({
      kind: "document-client",
      client,
    }));

    const dynamodb = await loadModule();

    const result = dynamodb.getDynamoDbDocumentClient({
      idToken: "id-token",
    });

    expect(fromCognitoIdentityPoolMock).toHaveBeenCalledWith({
      clientConfig: {
        region: "eu-central-1",
      },
      identityPoolId: "eu-central-1:pool-id",
      logins: {
        "cognito-idp.eu-central-1.amazonaws.com/eu-central-1_abc123":
          "id-token",
      },
    });
    expect(dynamoDbClientMock).toHaveBeenCalledWith({
      credentials: "credential-provider",
      region: "eu-central-1",
    });
    expect(result).toEqual({
      kind: "document-client",
      client: {
        config: {
          credentials: "credential-provider",
          region: "eu-central-1",
        },
      },
    });
  });
});
