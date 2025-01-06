import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface ProfileUpdateRequest {
  email: string;
  username: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username }: ProfileUpdateRequest = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Art Auction <onboarding@resend.dev>",
        to: [email],
        subject: "Profile Updated Successfully",
        html: `
          <div style="
            font-family: ui-sans-serif, system-ui, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
          ">
            <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Profile Update Confirmation</h1>
            <p>Hello ${username},</p>
            <p>Your profile has been successfully updated.</p>
            <p>If you did not make this change, please contact support immediately.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
              This is an automated message, please do not reply.
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending profile update email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send profile update email" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);