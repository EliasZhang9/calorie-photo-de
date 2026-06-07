import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

type DynamoDbDocumentClientInput = {
  idToken: string;
};

function getAwsRegion() {
  const region = process.env.AWS_REGION;

  if (!region) {
    throw new Error("Missing AWS_REGION environment variable.");
  }

  return region;
}

function getIdentityPoolId() {
  const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;

  if (!identityPoolId) {
    throw new Error(
      "Missing NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID environment variable.",
    );
  }

  return identityPoolId;
}

function getIdentityPoolRegion(identityPoolId: string) {
  const separatorIndex = identityPoolId.indexOf(":");

  if (separatorIndex <= 0) {
    throw new Error("NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID is malformed.");
  }

  return identityPoolId.slice(0, separatorIndex);
}

function getCognitoUserPoolProviderName() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

  if (!userPoolId) {
    throw new Error("Missing NEXT_PUBLIC_COGNITO_USER_POOL_ID environment variable.");
  }

  const separatorIndex = userPoolId.indexOf("_");

  if (separatorIndex <= 0) {
    throw new Error("NEXT_PUBLIC_COGNITO_USER_POOL_ID is malformed.");
  }

  const userPoolRegion = userPoolId.slice(0, separatorIndex);

  return `cognito-idp.${userPoolRegion}.amazonaws.com/${userPoolId}`;
}

export function getDynamoDbDocumentClient({
  idToken,
}: DynamoDbDocumentClientInput) {
  const region = getAwsRegion();
  const identityPoolId = getIdentityPoolId();
  const dynamoDbClient = new DynamoDBClient({
    credentials: fromCognitoIdentityPool({
      clientConfig: {
        region: getIdentityPoolRegion(identityPoolId),
      },
      identityPoolId,
      logins: {
        [getCognitoUserPoolProviderName()]: idToken,
      },
    }),
    region,
  });

  return DynamoDBDocumentClient.from(dynamoDbClient);
}

export function getMealLogsTableName() {
  const tableName = process.env.MEAL_LOGS_TABLE_NAME;

  if (!tableName) {
    throw new Error("Missing MEAL_LOGS_TABLE_NAME environment variable.");
  }

  return tableName;
}
