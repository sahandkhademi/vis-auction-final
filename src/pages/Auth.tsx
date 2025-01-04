import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ViewType } from "@supabase/auth-ui-shared";

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>("sign_in");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen pt-32 bg-white">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-light mb-8 text-center">
          {view === "sign_in" ? "Sign in" : "Sign up"}
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                },
                radii: {
                  borderRadiusButton: '0',
                  buttonBorderRadius: '0',
                  inputBorderRadius: '0',
                },
              },
            },
          }}
          providers={[]}
          view={view}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Password',
              },
            },
          }}
          onViewChange={(viewType) => setView(viewType)}
        />
      </div>
    </div>
  );
};

export default AuthPage;