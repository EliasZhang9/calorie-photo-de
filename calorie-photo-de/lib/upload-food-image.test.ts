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

  it("allows an authorized user to upload an image to S3", async () => {
    uploadDataMock.mockImplementation(({ path, options }) => {
      options?.onProgress?.({
        transferredBytes: 5,
        totalBytes: 10,
      });

      return {
        result: Promise.resolve({
          path: path({ identityId: "eu-central-1:identity-123" }),
        }),
      };
    });

    const { uploadFoodImage } = await loadModule();
    const file = new File(["demo"], "meal photo.jpg", { type: "image/jpeg" });
    const onProgress = vi.fn();

    const storedPath = await uploadFoodImage({
      file,
      username: "demo user",
      now: () => 123,
      onProgress,
    });

    expect(storedPath).toBe(
      "private/eu-central-1:identity-123#demo-user/food-images/123-meal-photo.jpg",
    );
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(uploadDataMock).toHaveBeenCalledOnce();
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
