"use client";

import { Amplify } from "aws-amplify";

const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

let isConfigured = false;

export function hasAmplifyAuthConfig() {
  return Boolean(userPoolId && userPoolClientId);
}

export function configureAmplifyAuth() {
  if (isConfigured || !hasAmplifyAuthConfig()) {
    return;
  }

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

  isConfigured = true;
}
