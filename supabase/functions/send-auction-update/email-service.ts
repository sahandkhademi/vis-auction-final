const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailContent {
  subject: string;
  html: string;
}

export const sendEmail = async (to: string, content: EmailContent) => {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set');
    throw new Error('RESEND_API_KEY is not set');
  }

  try {
    console.log('🚀 Sending email to:', to);
    console.log('📧 Email content:', content);

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
      console.error('❌ Failed to send email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}