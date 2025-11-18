import { sanitizeFileName } from '../lib/utils';
   
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = 'dx2ln0aei';
  const uploadPreset = 'nextarc_unsigned';

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary configuration is missing.");
    throw new Error("Cloudinary configuration is missing.");
  }
  
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  
  const sanitizedName = sanitizeFileName(file.name);

  formData.append("file", file, sanitizedName);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Image upload failed.");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
