import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const EmailTester = () => {
  const [isSending, setIsSending] = useState(false);

  const handleTestEmails = async () => {
    try {
      setIsSending(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to send test emails");
        return;
      }

      console.log("Starting test email request with session:", session.user.email);

      const { data, error } = await supabase.functions.invoke('test-email-templates', {
        body: { 
          test: true,
          userEmail: session.user.email,
          forceSend: true // Add this to ensure email is sent regardless of preferences
        },
      });

      console.log("Response from test-email-templates:", { data, error });

      if (error) {
        console.error("Error details:", error);
        throw new Error(error.message || "Failed to send test emails");
      }

      if (!data) {
        throw new Error("No response data received");
      }

      toast.success("Test emails sent successfully! Please check your inbox and spam folder.");
      console.log("Test emails sent to:", data.recipients);
    } catch (error) {
      console.error("Error sending test emails:", error);
      toast.error(error.message || "Failed to send test emails");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl">Email Template Tester</h2>
      <p className="text-muted-foreground">
        Send test emails to preview all email templates. Emails will be sent to your account email address.
      </p>
      <Button 
        onClick={handleTestEmails} 
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Send Test Emails"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Note: If you don't receive the emails, please check your spam folder.
      </p>
    </div>
  );
};