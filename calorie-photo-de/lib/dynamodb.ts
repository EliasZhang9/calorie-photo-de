import "server-only";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let documentClient: DynamoDBDocumentClient | null = null;

export function getDynamoDbDocumentClient() {
  if (documentClient) {
    return documentClient;
  }

  const region = process.env.AWS_REGION;

  if (!region) {
    throw new Error("Missing AWS_REGION environment variable.");
  }

  const dynamoDbClient = new DynamoDBClient({ region });

  documentClient = DynamoDBDocumentClient.from(dynamoDbClient);

  return documentClient;
}

export function getMealLogsTableName() {
  const tableName = process.env.MEAL_LOGS_TABLE_NAME;

  if (!tableName) {
    throw new Error("Missing MEAL_LOGS_TABLE_NAME environment variable.");
  }

  return tableName;
}
