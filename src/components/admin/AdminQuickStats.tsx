import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, MessageSquare, DollarSign, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminQuickStats = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: stats } = useQuery({
    queryKey: ["admin-quick-stats"],
    queryFn: async () => {
      const [ordersResult, messagesResult, carsResult, todayOrdersResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["pending", "processing"]),
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("cars")
          .select("id", { count: "exact", head: true })
          .eq("status", "available"),
        supabase
          .from("orders")
          .select("total_amount")
          .gte("created_at", new Date().toISOString().split("T")[0]),
      ]);

      const todayRevenue = todayOrdersResult.data?.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      ) || 0;

      return {
        pendingOrders: ordersResult.count || 0,
        newMessages: messagesResult.count || 0,
        availableCars: carsResult.count || 0,
        todayRevenue,
      };
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });

  const statItems = [
    {
      icon: ShoppingCart,
      value: stats?.pendingOrders || 0,
      label: isRTL ? "طلبات معلقة" : "Pending Orders",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      show: (stats?.pendingOrders || 0) > 0,
    },
    {
      icon: MessageSquare,
      value: stats?.newMessages || 0,
      label: isRTL ? "رسائل جديدة" : "New Messages",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      show: (stats?.newMessages || 0) > 0,
    },
    {
      icon: Car,
      value: stats?.availableCars || 0,
      label: isRTL ? "سيارة متوفرة" : "Available Cars",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      show: true,
    },
    {
      icon: DollarSign,
      value: `${((stats?.todayRevenue || 0) / 1000).toFixed(0)}K`,
      label: isRTL ? "إيرادات اليوم" : "Today Revenue",
      color: "text-primary",
      bgColor: "bg-primary/10",
      show: true,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {statItems
        .filter((item) => item.show)
        .slice(0, 3)
        .map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${item.bgColor} transition-all hover:scale-105`}
          >
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <span className={`text-sm font-semibold ${item.color}`}>
              {item.value}
            </span>
            <span className="text-xs text-muted-foreground hidden lg:inline">
              {item.label}
            </span>
          </div>
        ))}
    </div>
  );
};

export default AdminQuickStats;
