import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Package, 
  Tag, 
  Star, 
  Check, 
  CheckCheck, 
  X, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Database,
  Satellite
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const notificationIcons: Record<string, React.ReactNode> = {
  order: <Package className="h-4 w-4" />,
  promotion: <Tag className="h-4 w-4" />,
  review: <Star className="h-4 w-4" />,
  default: <Bell className="h-4 w-4" />,
};

interface NotificationCenterProps {
  isTransparent?: boolean;
}

const NotificationCenter = ({ isTransparent }: NotificationCenterProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  if (!userId) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative group",
            isTransparent ? "text-white hover:bg-white/10 nav-icon-shadow" : "text-foreground hover:bg-foreground/5"
          )}
        >
          <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-black text-[9px] font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(196,164,132,0.5)]"
            >
               {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isRTL ? "left" : "right"} 
        className="w-full sm:max-w-xl bg-black border-white/5 p-0 flex flex-col gap-0 text-white selection:bg-primary/30"
      >
        {/* Dispatch Header */}
        <div className="p-12 border-b border-white/5 bg-surface-low/30 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] -rotate-12">
             <Satellite className="h-40 w-40" />
          </div>
          
          <div className="relative z-10 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-primary font-black">
                   <Zap className="h-3 w-3" />
                   {isRTL ? "مركز الاستجابة" : "RESPONSE CENTER"}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-[9px] uppercase tracking-[0.4em] text-white/20 hover:text-primary transition-colors font-black flex items-center gap-3"
                  >
                    <CheckCheck className="h-3 w-3" />
                    {isRTL ? "قراءة الكل" : "EXECUTE READ ALL"}
                  </button>
                )}
             </div>
             <SheetHeader className="space-y-0">
               <SheetTitle className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none">
                  {isRTL ? "الإشعارات" : "Institutional"} <span className="text-white/20">Dispatch.</span>
               </SheetTitle>
             </SheetHeader>
          </div>
        </div>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-hidden flex flex-col pt-8">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/10 font-black">Syncing Frequency...</span>
            </div>
          ) : notifications?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-12">
              <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                 <Bell className="h-10 w-10 text-white/5" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-xl font-bold uppercase tracking-tighter">
                   {isRTL ? "لا توجد إشارات" : "Zero Signals"}
                 </h3>
                 <p className="text-[11px] uppercase tracking-[0.4em] text-white/20 max-w-[240px] leading-relaxed mx-auto">
                   {isRTL ? "لا توجد إشعارات حالياً" : "The institutional dispatch feed is currently dormant. No active signals detected."}
                 </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-12">
              <div className="space-y-4 py-8">
                <AnimatePresence>
                  {notifications?.map((notification, idx) => (
                    <motion.button
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full text-start group relative flex gap-8 p-8 border hover:border-primary/20 transition-all duration-700 overflow-hidden",
                        notification.is_read ? "bg-black border-white/5" : "bg-surface-low border-primary/10 shadow-[inner_0_0_20px_rgba(196,164,132,0.02)]"
                      )}
                    >
                      {!notification.is_read && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(196,164,132,0.5)]" />
                      )}

                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center shrink-0 border transition-all duration-700",
                        notification.is_read ? "bg-white/5 border-white/5 text-white/20" : "bg-primary/5 border-primary/20 text-primary"
                      )}>
                        {notificationIcons[notification.type] || notificationIcons.default}
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className={cn(
                             "text-[9px] uppercase tracking-[0.4em] font-black",
                             notification.is_read ? "text-white/10" : "text-primary/60"
                           )}>
                              Signal Type // {notification.type || "SYSTEM"}
                           </span>
                           <span className="text-[8px] uppercase tracking-[0.3em] text-white/10">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: isRTL ? ar : undefined,
                              })}
                           </span>
                        </div>
                        <h4 className={cn(
                          "text-lg font-black uppercase tracking-tighter transition-colors",
                          notification.is_read ? "text-white/40" : "text-white group-hover:text-primary"
                        )}>
                           {isRTL ? notification.title_ar || notification.title : notification.title}
                        </h4>
                        <p className={cn(
                          "text-[10px] uppercase tracking-[0.2em] leading-relaxed line-clamp-2",
                          notification.is_read ? "text-white/20 italic" : "text-white/40 font-medium"
                        )}>
                           {isRTL ? notification.message_ar || notification.message : notification.message}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Dispatch Footer */}
        <div className="p-12 border-t border-white/5 bg-surface-low flex items-center justify-between shrink-0">
           <div className="flex items-center gap-8 text-[9px] uppercase tracking-[0.6em] text-white/10 font-black">
              <Database className="h-3 w-3" />
              SYSTEM UPTIME: 99.9%
           </div>
           <div className="flex items-center gap-4">
              <ShieldCheck className="h-3 w-3 text-primary opacity-20" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/10 italic">Secure Protocol Enabled</span>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
