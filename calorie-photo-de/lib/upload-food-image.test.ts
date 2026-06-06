import { afterEach, describe, expect, it, vi } from "vitest";

const uploadDataMock = vi.hoisted(() => vi.fn());

vi.mock("aws-amplify/storage", () => ({
  uploadData: uploadDataMock,
}));

async function loadModule() {
  return import("./upload-food-image");
}

describe("uploadFoodImage", () => {
  afterEach(() => {
    vi.resetModules();
    uploadDataMock.mockReset();
  });

  it("rejects when the user is not Cognito-authorized to upload", async () => {
    const unauthorizedError = new Error("Not authorized to access protected S3 resource.");

    uploadDataMock.mockReturnValue({
      result: {
        then: (_onFulfilled: unknown, onRejected: (reason: Error) => unknown) =>
          Promise.resolve(onRejected(unauthorizedError)),
      },
    });

    const { uploadFoodImage } = await loadModule();
    const file = new File(["demo"], "meal photo.jpg", { type: "image/jpeg" });

    await expect(
      uploadFoodImage({
        file,
        username: "guest-user",
        now: () => 123,
      }),
    ).rejects.toThrow("Not authorized to access protected S3 resource.");
  });
});
