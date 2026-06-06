import { uploadData } from "aws-amplify/storage";

type UploadFoodImageInput = {
  file: File;
  username?: string;
  now?: () => number;
  onProgress?: (progress: number) => void;
};

export async function uploadFoodImage({
  file,
  username,
  now = Date.now,
  onProgress,
}: UploadFoodImageInput) {
  const sanitizedUsername = (username ?? "unknown-user").replace(
    /[^a-zA-Z0-9._-]/g,
    "-",
  );
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  const result = await uploadData({
    // Keep each user's uploads in their own private folder in S3.
    path: ({ identityId }) =>
      `private/${identityId}#${sanitizedUsername}/food-images/${now()}-${sanitizedName}`,
    data: file,
    options: {
      contentType: file.type || "application/octet-stream",
      onProgress: ({ transferredBytes, totalBytes }) => {
        if (!totalBytes) {
          return;
        }

        onProgress?.(Math.round((transferredBytes / totalBytes) * 100));
      },
    },
  }).result;

  return result.path;
}
