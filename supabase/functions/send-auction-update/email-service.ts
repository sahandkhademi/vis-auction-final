import { EmailContent } from './types';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

export const sendEmail = async (to: string, content: EmailContent): Promise<Response> => {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    throw new Error('RESEND_API_KEY is not set');
  }

  console.log('Attempting to send email to:', to);
  console.log('Email content:', content);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Art Auction <onboarding@resend.dev>',
        to: [to],
        subject: content.subject,
        html: content.html
      })
    });

    const responseText = await response.text();
    console.log('Resend API response:', response.status, responseText);

    if (!response.ok) {
      throw new Error(`Failed to send email: ${responseText}`);
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};