
// This is a simulated email service for the MVP.
// In a real application, this would use a service like SendGrid, Mailgun, or AWS SES.

/**
 * Simulates sending an email by logging the details to the console.
 * @param to - The recipient's email address.
 * @param subject - The subject line of the email.
 * @param body - The HTML or text body of the email.
 */
export const sendEmail = async (to: string, subject: string, body: string): Promise<void> => {
  console.log("--- SIMULATING EMAIL ---");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("Body:");
  console.log(body);
  console.log("------------------------");

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
};
