

import { supabase } from '../lib/supabase';

// Real email service using Supabase Edge Functions and Resend.
// Ensure you have deployed the 'send-email' function and set the RESEND_API_KEY secret.

export const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { 
        to, 
        subject, 
        html: body.replace(/\n/g, '<br>') // Simple conversion for text to HTML
      },
    });

    if (error) {
      console.error('Supabase Edge Function returned an error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to send email via Supabase Edge Function:', error);
    // Fallback logging for development or if function is not deployed
    console.log("--- EMAIL FALLBACK (Backend Unavailable) ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Body:", body);
  }
};