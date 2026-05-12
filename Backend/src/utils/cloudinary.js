import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// ✅ ADD THIS CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // get file extension
    const ext = path.extname(localFilePath).toLowerCase();

    // ✅ BEST FIX (auto detect)
    let resourceType = "auto";

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      use_filename: true,
      unique_filename: false
    });

    console.log("Uploaded:", response.secure_url);

    fs.unlinkSync(localFilePath);

    return response;

  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Upload error:", error);
    return null;
  }
};