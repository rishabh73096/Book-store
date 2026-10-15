import cloudinary from "@/backend/config/cloudinary";

export type UploadResult = {
  url: string;
  publicId: string;
};

export function uploadImage(buffer: Buffer, folder = "uploads"): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}
