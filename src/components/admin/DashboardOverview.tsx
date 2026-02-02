import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, Users, ShoppingCart, DollarSign, Eye, TrendingUp, Clock, MessageSquare } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";

const DashboardOverview = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [carsRes, ordersRes, customersRes, paymentsRes] = await Promise.all([
        supabase.from("cars").select("id, views_count, status, price", { count: "exact" }),
        supabase.from("orders").select("id, status, total_amount, paid_amount, created_at", { count: "exact" }),
        supabase.from("customers").select("id", { count: "exact" }),
        supabase.from("payments").select("amount, status"),
      ]);

      const totalCars = carsRes.count || 0;
      const availableCars = carsRes.data?.filter(c => c.status === "available").length || 0;
      const soldCars = carsRes.data?.filter(c => c.status === "sold").length || 0;
      const reservedCars = carsRes.data?.filter(c => c.status === "reserved").length || 0;
      const totalViews = carsRes.data?.reduce((sum, car) => sum + (car.views_count || 0), 0) || 0;

      const totalOrders = ordersRes.count || 0;
      const newOrders = ordersRes.data?.filter(o => o.status === "new").length || 0;
      const completedOrders = ordersRes.data?.filter(o => o.status === "completed").length || 0;

      const totalRevenue = paymentsRes.data?.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const pendingPayments = paymentsRes.data?.filter(p => p.status === "pending").reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

      const totalCustomers = customersRes.count || 0;

      return {
        totalCars,
        availableCars,
        soldCars,
        reservedCars,
        totalViews,
        totalOrders,
        newOrders,
        completedOrders,
        totalRevenue,
        pendingPayments,
        totalCustomers,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(name), cars(name_ar)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ["orders-chart"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .order("created_at", { ascending: true });

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString(isRTL ? "ar" : "en", { weekday: "short" });
        const dayOrders = data?.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.toDateString() === date.toDateString();
        }) || [];
        last7Days.push({
          name: dayName,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
        });
      }
      return last7Days;
    },
  });

  const carStatusData = [
    { name: isRTL ? "متاحة" : "Available", value: stats?.availableCars || 0, color: "hsl(var(--primary))" },
    { name: isRTL ? "محجوزة" : "Reserved", value: stats?.reservedCars || 0, color: "hsl(45 80% 60%)" },
    { name: isRTL ? "مباعة" : "Sold", value: stats?.soldCars || 0, color: "hsl(142 76% 36%)" },
  ];

  const kpiCards = [
    { title: isRTL ? "إجمالي السيارات" : "Total Cars", value: stats?.totalCars || 0, icon: Car, color: "from-primary to-accent" },
    { title: isRTL ? "الطلبات الجديدة" : "New Orders", value: stats?.newOrders || 0, icon: ShoppingCart, color: "from-amber-500 to-orange-500" },
    { title: isRTL ? "العملاء" : "Customers", value: stats?.totalCustomers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: isRTL ? "الإيرادات" : "Revenue", value: `${(stats?.totalRevenue || 0).toLocaleString()} ${settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}`, icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { title: isRTL ? "المشاهدات" : "Views", value: stats?.totalViews || 0, icon: Eye, color: "from-purple-500 to-pink-500" },
    { title: isRTL ? "معدل التحويل" : "Conversion Rate", value: stats?.totalViews ? `${((stats?.completedOrders || 0) / stats.totalViews * 100).toFixed(1)}%` : "0%", icon: TrendingUp, color: "from-rose-500 to-red-500" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      new: { label: isRTL ? "جديد" : "New", class: "bg-blue-500/20 text-blue-400" },
      processing: { label: isRTL ? "قيد المعالجة" : "Processing", class: "bg-amber-500/20 text-amber-400" },
      reserved: { label: isRTL ? "محجوز" : "Reserved", class: "bg-purple-500/20 text-purple-400" },
      completed: { label: isRTL ? "مكتمل" : "Completed", class: "bg-green-500/20 text-green-400" },
      cancelled: { label: isRTL ? "ملغى" : "Cancelled", class: "bg-red-500/20 text-red-400" },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-gold transition-all duration-300">
            <CardContent className="p-4">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${kpi.color}`} />
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} opacity-80`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.title}</p>
                  <p className="text-lg font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Orders Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? "الطلبات والإيرادات (آخر 7 أيام)" : "Orders & Revenue (Last 7 Days)"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="2"
                    stroke="hsl(142 76% 36%)"
                    fill="hsl(142 76% 36% / 0.3)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Car Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? "حالة السيارات" : "Car Status"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {carStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {carStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isRTL ? "آخر الطلبات" : "Recent Orders"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders?.map((order) => {
              const status = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customers?.name || (isRTL ? "عميل غير معروف" : "Unknown Customer")} • {order.cars?.name_ar || (isRTL ? "سيارة محذوفة" : "Deleted Car")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                      {status.label}
                    </span>
                    <span className="font-bold text-primary">
                      {Number(order.total_amount).toLocaleString()} {settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                {isRTL ? "لا توجد طلبات حتى الآن" : "No orders yet"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
