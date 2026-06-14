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
  return Boolean(identityPoolId && storageBucket && storageRegion);
}

export function hasCompleteAmplifyConfig() {
  return hasAmplifyAuthConfig() && hasAmplifyStorageConfig();
}

export function hasPartialAmplifyConfig() {
  const hasAnyAmplifyConfig = Boolean(
    userPoolId ||
      userPoolClientId ||
      identityPoolId ||
      storageBucket ||
      storageRegion,
  );

  return hasAnyAmplifyConfig && !hasCompleteAmplifyConfig();
}

export function configureAmplifyAuth() {
  if (isConfigured || !hasCompleteAmplifyConfig()) {
    return;
  }

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

  isConfigured = true;
}
