import { UploadClient } from "@uploadcare/upload-client";
import fs from "fs/promises";

const client = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY
});

// 🔥 your CDN domain
const CDN_DOMAIN = "https://1tj3erng93.ucarecd.net";


export const uploadFileToUploadcare = async (localFilePath, fileName) => {
  try {
    if (!localFilePath) return null;

    const fileData = await fs.readFile(localFilePath);

    const result = await client.uploadFile(fileData, {
      store: true,
      fileName: fileName, // ✅ important
      contentType: "application/pdf", // ✅ important
    });

    console.log("Uploadcare Result:", result);

    await fs.unlink(localFilePath);

    
    return {
      url: `${CDN_DOMAIN}/${result.uuid}/${fileName}`
    };

  } catch (error) {
    console.error("Uploadcare Error:", error);

    try {
      await fs.unlink(localFilePath);
    } catch {}

    return null;
  }
};