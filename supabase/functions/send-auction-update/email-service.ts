const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailContent {
  subject: string;
  html: string;
}

export const sendEmail = async (to: string, content: EmailContent) => {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'VIS Auction <updates@visauction.com>',
        to: [to],
        subject: content.subject,
        html: content.html
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}