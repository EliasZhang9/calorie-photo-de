"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { Authenticator, Button } from "@aws-amplify/ui-react";
import {
  configureAmplifyAuth,
  hasAmplifyAuthConfig,
  hasAmplifyStorageConfig,
} from "@/lib/amplify-auth-config";
import { uploadFoodImage } from "@/lib/upload-food-image";

configureAmplifyAuth();

function MissingConfigState() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Storage setup needed
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
          Add your Amplify Storage settings
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
          This upload step stores food images in S3, so Amplify needs both your
          Cognito identity pool and S3 bucket details.
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
          Storage uses the identity pool to get temporary AWS credentials for
          S3 uploads.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
        >
          Go to login
        </Link>
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

type UploadFormProps = {
  username?: string;
};

function UploadForm({ username }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [storedPath, setStoredPath] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;

    setFile(nextFile);
    setMessage(null);
    setStoredPath(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Choose an image first.");
      return;
    }

    setIsUploading(true);
    setMessage(null);
    setStoredPath(null);
    setProgress(0);

    try {
      const path = await uploadFoodImage({
        file,
        username,
        onProgress: setProgress,
      });

      setStoredPath(path);
      setMessage("Upload complete.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed.";
      setMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-900">Upload a food image</h2>
          <p className="text-zinc-700">
            Pick one photo and we&apos;ll store it in your private S3 folder.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-zinc-800">Food image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-800 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-zinc-700"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleUpload}
            isDisabled={!file || isUploading}
            variation="primary"
          >
            {isUploading ? "Uploading..." : "Upload to S3"}
          </Button>
          <Link
            href="/"
            className="inline-flex rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Back home
          </Link>
        </div>

        {progress > 0 ? (
          <p className="text-sm text-zinc-600">Progress: {progress}%</p>
        ) : null}

        {message ? <p className="text-sm text-zinc-700">{message}</p> : null}

        {storedPath ? (
          <div className="space-y-2 rounded-md bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-900">Stored path</p>
            <code className="block overflow-x-auto text-sm text-zinc-700">
              {storedPath}
            </code>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">What this step does</h2>
        <ul className="space-y-3 text-zinc-700">
          <li>Uploads the selected file directly from the browser to S3.</li>
          <li>Uses your Cognito identity pool to get temporary AWS credentials.</li>
          <li>Keeps each user&apos;s files under a private path.</li>
        </ul>
      </aside>
    </section>
  );
}

export default function UploadPage() {
  if (!hasAmplifyAuthConfig() || !hasAmplifyStorageConfig()) {
    return <MissingConfigState />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:px-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Food image storage
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
          Save food photos to S3
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
          Sign in, choose a food photo, and store it with Amplify Storage so we
          can use it in later calorie analysis steps.
        </p>
      </div>

      <Authenticator loginMechanisms={["username", "email"]} initialState="signIn">
        {({ user }) => <UploadForm username={user?.username} />}
      </Authenticator>
    </main>
  );
}
