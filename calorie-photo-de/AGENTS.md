## Working style

- Teach me while coding: briefly explain what you are doing and why as you work.
- Do not implement more than the requested step.
- After changing code, summarize what changed.
- Prefer small commits.

## Project overview

- This is a `Next.js 16` App Router project using `React 19`, `TypeScript`, and Tailwind-based styling through the `app/` directory.
- The current product flow is:
  `home -> login -> upload -> API storage/logging groundwork`
- Auth and client-side file upload use `aws-amplify` and `@aws-amplify/ui-react`.
- Server-side meal log writes use the AWS SDK v3 DynamoDB document client.

## Important paths

- `app/page.tsx`: landing page with links to login, upload, and a not-yet-implemented dashboard.
- `app/login/page.tsx`: Cognito login UI using Amplify `Authenticator`.
- `app/upload/page.tsx`: authenticated S3 upload flow from the browser.
- `app/api/meals/route.ts`: POST route that validates meal-log payloads and writes to DynamoDB.
- `lib/amplify-auth-config.ts`: shared Amplify setup and env-var guards.
- `lib/dynamodb.ts`: server-only DynamoDB client and table-name accessors.
- `lib/meal-log.ts`: meal-log types and status validation helpers.
- `lib/amplify-auth-config.test.ts`: current Vitest coverage.

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
- The `/api/meals` route requires `AWS_REGION` and `MEAL_LOGS_TABLE_NAME` on the server.

## Code conventions for this repo

- Use the `@/*` import alias defined in `tsconfig.json` for local imports when it keeps paths clearer.
- Keep client/server boundaries explicit:
  use `"use client"` only where browser APIs, React state, or Amplify UI require it.
- Reuse the helpers in `lib/amplify-auth-config.ts`, `lib/dynamodb.ts`, and `lib/meal-log.ts` instead of duplicating env checks or validation logic.
- Keep validation strict and user-facing errors clear, following the pattern in `app/api/meals/route.ts`.
- Favor small, targeted changes. Do not expand scope beyond the requested step.

## Current project status and gotchas

- `app/page.tsx` links to `/dashboard`, but there is no `app/dashboard/page.tsx` yet.
- `README.md` is still the default Next.js starter README and does not describe this app yet.
- The `scripts/` directory is currently empty.
- Test coverage is minimal right now; only `lib/amplify-auth-config.ts` has a test file in the repo.

## When changing this project

- If you touch auth or upload flows, verify which env vars are required for the specific screen.
- If you touch `/api/meals`, preserve the existing validation rules:
  `imageKey` required, status must be valid, calorie values must be non-negative integers, and `caloriesMax >= caloriesMin`.
- If you add new AWS-backed features, document any new env vars in `.env.example`.
- If you implement the dashboard or meal history flow, update this file and the README to reflect the new entry points.
