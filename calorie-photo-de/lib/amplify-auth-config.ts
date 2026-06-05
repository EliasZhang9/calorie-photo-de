"use client";

import { Amplify } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
const identityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;
const storageBucket = process.env.NEXT_PUBLIC_S3_BUCKET;
const storageRegion = process.env.NEXT_PUBLIC_S3_REGION;

let isConfigured = false;

export function hasAmplifyAuthConfig() {
  return Boolean(userPoolId && userPoolClientId);
}

export function hasAmplifyStorageConfig() {
  return Boolean(
    hasAmplifyAuthConfig() &&
      identityPoolId &&
      storageBucket &&
      storageRegion,
  );
}

export function configureAmplifyAuth() {
  if (isConfigured || !hasAmplifyAuthConfig()) {
    return;
  }

  if (hasAmplifyStorageConfig()) {
    Amplify.configure(
      {
        Auth: {
          Cognito: {
            userPoolId: userPoolId!,
            userPoolClientId: userPoolClientId!,
            identityPoolId: identityPoolId!,
            loginWith: {
              email: true,
            },
          },
        },
        Storage: {
          S3: {
            bucket: storageBucket!,
            region: storageRegion!,
          },
        },
      },
      { ssr: true },
    );
  } else {
    Amplify.configure(
      {
        Auth: {
          Cognito: {
            userPoolId: userPoolId!,
            userPoolClientId: userPoolClientId!,
            loginWith: {
              email: true,
            },
          },
        },
      },
      { ssr: true },
    );
  }

  isConfigured = true;
}
