import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendInvitationEmail({
  email,
  token,
  invitedByName,
}: {
  email: string;
  token: string;
  invitedByName: string;
}) {
  const acceptUrl = `${APP_URL}/invitation/${token}`;

  try {
    await resend.emails.send({
      from: 'frontAgent <onboarding@resend.dev>',
      to: email,
      subject: 'You have been invited to frontAgent',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You've been invited!</h1>
          <p style="color: #666; font-size: 16px;">
            <strong>${invitedByName}</strong> has invited you to join frontAgent.
          </p>
          <p style="color: #666; font-size: 16px;">
            Click the button below to set your password and get started:
          </p>
          <a href="${acceptUrl}" style="
            display: inline-block;
            background-color: #000;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          ">Set Password</a>
          <p style="color: #999; font-size: 14px;">
            This link expires in 24 hours.
          </p>
          <p style="color: #999; font-size: 14px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return { success: false, error };
  }
}