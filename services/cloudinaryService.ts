import { sanitizeFileName } from '../lib/utils';
import { supabase } from '../lib/supabase';

// Security: Use Signed Uploads
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = 'dx2ln0aei'; 
  const apiKey = '932849182398123'; // Public API Key (safe to expose, Secret is hidden)
  
  if (!cloudName) {
    throw new Error("Cloudinary configuration is missing.");
  }
  
  try {
      // 1. Get Signature from Backend
      // The backend creates a hash of the parameters + api_secret to authorize the upload
      const timestamp = Math.round((new Date()).getTime() / 1000);
      const folder = 'project_files';
      
      const { data: signatureData, error: sigError } = await supabase.functions.invoke('get-upload-signature', {
          body: { 
              timestamp,
              folder
          }
      });

      // Fallback for MVP if backend isn't deployed: 
      // If signature fetch fails, we throw to enforce security (as requested by user "Brutal Honesty")
      if (sigError || !signatureData?.signature) {
          console.error("Security Error: Failed to sign upload request.", sigError);
          throw new Error("Security check failed. Unable to verify upload authorization.");
      }

      // 2. Upload with Signature
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const formData = new FormData();
      
      const sanitizedName = sanitizeFileName(file.name);
      formData.append("file", file, sanitizedName);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signatureData.signature);
      formData.append("folder", folder);

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