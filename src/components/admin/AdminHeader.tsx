import { Button } from "@/components/ui/button";
import { LogOut, Bell, Settings } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeToggle from "@/components/ThemeToggle";
import AdminQuickStats from "./AdminQuickStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdminHeaderProps {
  onLogout: () => void;
  userEmail?: string;
}

const AdminHeader = ({ onLogout, userEmail }: AdminHeaderProps) => {
  const { data: settings } = useSettings();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: notificationCount } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const [orders, messages] = await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["pending"]),
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
      ]);
      return (orders.count || 0) + (messages.count || 0);
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });

  const showroomName = isRTL
    ? settings?.showroom_name || "لوحة التحكم"
    : settings?.showroom_name_en || "Dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo & Name */}
        <div className="flex items-center gap-3">
          {settings?.logo_url ? (
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={settings.logo_url} alt={showroomName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {showroomName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {showroomName.charAt(0)}
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">{showroomName}</h1>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "لوحة التحكم" : "Admin Dashboard"}
            </p>
          </div>
        </div>

        {/* Quick Stats - Hidden on mobile */}
        <div className="hidden md:flex">
          <AdminQuickStats />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {(notificationCount || 0) > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {userEmail?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{isRTL ? "المدير" : "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                {isRTL ? "الإعدادات" : "Settings"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {isRTL ? "تسجيل الخروج" : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
