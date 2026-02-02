import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const ALLOWED_ADMIN_EMAIL = "abdo12uk@gmail.com";

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" && session) {
                // Check for specific admin email
                if (session.user.email === ALLOWED_ADMIN_EMAIL) {
                    navigate("/admin");
                    return;
                }

                // Check user role
                const { data: roleData } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", session.user.id)
                    .eq("role", "admin")
                    .maybeSingle();

                if (roleData) {
                    navigate("/admin");
                } else {
                    navigate("/profile");
                }
            } else if (event === "SIGNED_OUT") {
                navigate("/auth");
            }
        });

        // Fallback if no event fires immediately (e.g. already handled)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth");
                return;
            }

            // If session exists, same logic as above
            if (session.user.email === ALLOWED_ADMIN_EMAIL) {
                navigate("/admin");
                return;
            }

            const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .eq("role", "admin")
                .maybeSingle();

            if (roleData) {
                navigate("/admin");
            } else {
                navigate("/profile");
            }
        };

        checkSession();

    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{language === "ar" ? "معرض الفخيم للسيارات..." : "Al-Fakhim Car Showroom..."}</p>
            </div>
        </div>
    );
};

export default AuthCallback;
