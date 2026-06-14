"use client";

import Link from "next/link";
import { Authenticator, Button } from "@aws-amplify/ui-react";
import {
  configureAmplifyAuth,
  hasCompleteAmplifyConfig,
  hasPartialAmplifyConfig,
} from "@/lib/amplify-auth-config";

configureAmplifyAuth();

function MissingConfigState() {
  const isPartialConfig = hasPartialAmplifyConfig();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Amplify setup needed
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
          Add your Amplify Cognito and Storage settings
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
          {isPartialConfig
            ? "Your Amplify setup is incomplete. This app now expects Cognito and S3 settings together before the login flow starts."
            : "The login UI is wired up, but it needs both your Cognito and S3 details before it can connect."}
        </p>
      </div>

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Set these env vars</h2>
        <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-sm text-zinc-100">
{`NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=
NEXT_PUBLIC_S3_BUCKET=
NEXT_PUBLIC_S3_REGION=`}
        </pre>
        <p className="text-sm leading-6 text-zinc-600">
          Cognito handles sign-in, and the S3-related settings complete the
          shared Amplify configuration this app expects.
        </p>
      </section>

      <div>
        <Link
          href="/"
          className="inline-flex rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-800 hover:bg-zinc-100"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  if (!hasCompleteAmplifyConfig()) {
    return <MissingConfigState />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Account access
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
          Sign in to Calorie Photo
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
          Log in with your Cognito account to keep your photo uploads and meal
          history tied to you.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900">Why sign in?</h2>
          <ul className="space-y-3 text-zinc-700">
            <li>Save calorie estimates to your own history.</li>
            <li>Keep progress separate for each account.</li>
            <li>Prepare the app for protected upload and dashboard routes.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <Authenticator loginMechanisms={["username", "email"]} initialState="signIn">
            {({ signOut, user }) => (
              <div className="space-y-4 p-2">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-zinc-900">
                    You&apos;re signed in
                  </h2>
                  <p className="text-zinc-700">
                    {user?.signInDetails?.loginId ?? "Authenticated user"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
                  >
                    Go home
                  </Link>
                  <Button onClick={signOut} variation="primary">
                    Sign out
                  </Button>
                </div>
              </div>
            )}
          </Authenticator>
        </div>
      </section>
    </main>
  );
}
