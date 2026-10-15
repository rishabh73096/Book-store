import { apiRequest } from "@/services/api";

export type UploadResult = {
  url: string;
  publicId: string;
};

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<UploadResult>("/upload", {
    method: "POST",
    body: formData,
    retryOn401: true,
  });
}
