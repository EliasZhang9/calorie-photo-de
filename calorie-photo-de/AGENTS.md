## Working style

- Teach me while coding: briefly explain what you are doing and why as you work.
- Do not implement more than the requested step.
- After changing code, summarize what changed.
- Prefer small commits.

## Project overview

- This is a `Next.js 16` App Router project using `React 19`, `TypeScript`, and Tailwind-based styling through the `app/` directory.
- The current product flow is:
  `home -> login -> upload -> Amplify Storage + protected API route meal logging`
- Auth and client-side file upload use `aws-amplify` and `@aws-amplify/ui-react`.
- Meal log creation now goes through a Next.js API route that verifies Cognito auth before writing to DynamoDB.

## Important paths

- `app/page.tsx`: landing page with links to login, upload, and a not-yet-implemented dashboard.
- `app/login/page.tsx`: Cognito login UI using Amplify `Authenticator`.
- `app/upload/page.tsx`: authenticated S3 upload flow from the browser that then calls the protected meal-log API route.
- `app/api/meals/route.ts`: POST route that validates meal-log payloads, verifies a Cognito bearer token, and writes to DynamoDB.
- `lib/amplify-auth-config.ts`: shared Amplify setup and env-var guards.
- `lib/cognito-auth.ts`: server-side Cognito JWT verification helper for protected API routes.
- `lib/create-meal-log.ts`: client-side helper that posts meal-log writes to the protected API route.
- `lib/dynamodb.ts`: server-only DynamoDB client and table-name accessors.
- `lib/meal-log.ts`: meal-log types and status validation helpers.
- `lib/upload-food-image.ts`: shared Amplify Storage helper for building private S3 upload paths and forwarding progress.
- `lib/amplify-auth-config.test.ts`: Vitest coverage for Amplify env/config behavior.
- `lib/create-meal-log.test.ts`: Vitest coverage for authenticated client-to-API meal-log creation behavior.
- `lib/upload-food-image.test.ts`: Vitest coverage for authorized and unauthorized S3 upload behavior.

## Commands

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Lint: `npm run lint`
- Run tests: `npm run test`
- Production build: `npm run build`

## Environment variables

From `.env.example`, the project currently expects:

- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID`
- `NEXT_PUBLIC_S3_BUCKET`
- `NEXT_PUBLIC_S3_REGION`
- `AWS_REGION`
- `MEAL_LOGS_TABLE_NAME`

Notes:

- Login only needs the two `NEXT_PUBLIC_COGNITO_*` user-pool values.
- Upload requires the Cognito values plus identity-pool and S3 values.
- The protected `/api/meals` route requires `AWS_REGION` and `MEAL_LOGS_TABLE_NAME` on the server.
- The API route also verifies Cognito access tokens using the existing public user-pool env vars.

## Code conventions for this repo

- Use the `@/*` import alias defined in `tsconfig.json` for local imports when it keeps paths clearer.
- Keep client/server boundaries explicit:
  use `"use client"` only where browser APIs, React state, or Amplify UI require it.
- Reuse the helpers in `lib/amplify-auth-config.ts`, `lib/cognito-auth.ts`, `lib/create-meal-log.ts`, `lib/dynamodb.ts`, `lib/upload-food-image.ts`, and `lib/meal-log.ts` instead of duplicating env checks, token verification, API call wiring, S3 upload wiring, or validation logic.
- Keep validation strict and user-facing errors clear in the shared client helpers and route components.
- Favor small, targeted changes. Do not expand scope beyond the requested step.

## Current project status and gotchas

- `app/page.tsx` links to `/dashboard`, but there is no `app/dashboard/page.tsx` yet.
- `README.md` is still the default Next.js starter README and does not describe this app yet.
- The `scripts/` directory is currently empty.
- Test coverage is still small, but the repo now includes focused Vitest coverage for Amplify config, protected meal-log writes, and S3 upload authorization behavior.

## When changing this project

- If you touch auth or upload flows, verify which env vars are required for the specific screen.
- If you touch protected meal-log writes, keep the client-side API call logic in `lib/create-meal-log.ts` and the server-side token verification in `lib/cognito-auth.ts`.
- If you touch S3 upload behavior, keep the logic in `lib/upload-food-image.ts` so it remains unit-testable.
- If you add new AWS-backed features, document any new env vars in `.env.example`.
- If you change upload authorization or path-building rules, update `lib/upload-food-image.test.ts` to cover both allowed and denied cases.
- If you implement the dashboard or meal history flow, update this file and the README to reflect the new entry points.
