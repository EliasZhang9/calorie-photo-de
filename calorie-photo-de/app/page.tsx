export default function Home() {
  const currentEnvironment = process.env.NODE_ENV ?? "unknown";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-12 sm:px-10">
      <section className="space-y-4">
        <p className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900">
          Environment: {currentEnvironment}
        </p>
        <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
          Food Photo Calorie Estimator
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
          Upload a food photo and get a quick calorie estimate to support daily
          tracking and better meal decisions.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">How It Works</h2>
        <p className="text-zinc-700">
          The app analyzes your image, identifies likely foods, and returns an
          estimated calorie range for the meal.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Important Note</h2>
        <p className="text-zinc-700">
          Calorie results are approximate ranges, not exact measurements.
          Portion size, ingredients, and image quality can affect accuracy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900">Get Started</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/login"
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700"
          >
            Login
          </a>
          <a
            href="/upload"
            className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Upload Photo
          </a>
          <a
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-4 py-2 font-medium text-zinc-800 hover:bg-zinc-100"
          >
            Dashboard
          </a>
        </div>
      </section>
    </main>
  );
}
