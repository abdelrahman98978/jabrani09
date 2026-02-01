import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Bell, Package, Gift, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNotificationSound } from "@/hooks/useNotificationSound";

interface Notification {
  id: string;
  title: string;
  title_ar: string | null;
  message: string;
  message_ar: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const RealtimeNotifications = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const { playNotificationSound } = useNotificationSound();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          showNotificationToast(notification);
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isRTL]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-primary" />;
      case "promotion":
        return <Gift className="h-5 w-5 text-green-500" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const showNotificationToast = (notification: Notification) => {
    const title = isRTL && notification.title_ar ? notification.title_ar : notification.title;
    const message = isRTL && notification.message_ar ? notification.message_ar : notification.message;

    toast.custom(
      (t) => (
        <div 
          className="bg-card border border-border rounded-xl shadow-xl p-4 max-w-sm w-full animate-in slide-in-from-top-5 fade-in duration-300"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{title}</p>
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={() => toast.dismiss(t)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {notification.link && (
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto text-xs"
              onClick={() => {
                toast.dismiss(t);
                navigate(notification.link!);
              }}
            >
              {isRTL ? "عرض التفاصيل ←" : "View details →"}
            </Button>
          )}
        </div>
      ),
      {
        duration: 6000,
        position: isRTL ? "top-left" : "top-right",
      }
    );
  };

  // This component doesn't render anything visible
  return null;
};

export default RealtimeNotifications;
