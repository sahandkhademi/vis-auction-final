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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-email-templates`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send test emails");
      }

      toast.success("Test emails sent successfully!");
      console.log("Test emails sent to:", result.recipients);
    } catch (error) {
      console.error("Error sending test emails:", error);
      toast.error(error.message || "Failed to send test emails");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-serif">Email Template Tester</h2>
      <p className="text-muted-foreground">
        Send test emails to all admin accounts to preview the email templates.
      </p>
      <Button 
        onClick={handleTestEmails} 
        disabled={isSending}
      >
        {isSending ? "Sending..." : "Send Test Emails"}
      </Button>
    </div>
  );
};