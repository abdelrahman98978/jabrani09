import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Car, Calendar, Loader2, Brain, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AdvancedAnalytics = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === "ar";
  const [aiInsights, setAiInsights] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const { data: ordersData } = useQuery({
    queryKey: ["analytics-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, customers(name), cars(name_ar, brand_id, price)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["analytics-payments"],
    queryFn: async () => {
      const { data } = await supabase.from("payments").select("*");
      return data || [];
    },
  });

  const { data: carsData } = useQuery({
    queryKey: ["analytics-cars"],
    queryFn: async () => {
      const { data } = await supabase.from("cars").select("*, brands(name_ar)");
      return data || [];
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ["analytics-brands"],
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("*");
      return data || [];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
      return data;
    },
  });

  // Calculate monthly revenue
  const monthlyRevenue = () => {
    const months: Record<string, number> = {};
    paymentsData?.filter(p => p.status === "completed").forEach(payment => {
      const date = new Date(payment.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + Number(payment.amount);
    });
    return Object.entries(months).map(([month, revenue]) => ({
      month: new Date(month + "-01").toLocaleDateString(isRTL ? "ar" : "en", { month: "short", year: "numeric" }),
      revenue,
    })).slice(-6);
  };

  // Orders by status
  const ordersByStatus = () => {
    const statusCounts: Record<string, number> = {};
    ordersData?.forEach(order => {
      const status = order.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const colors = {
      new: "hsl(220 80% 60%)",
      processing: "hsl(45 80% 60%)",
      completed: "hsl(142 76% 36%)",
      cancelled: "hsl(0 80% 50%)",
      reserved: "hsl(280 80% 60%)",
    };
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count,
      color: colors[status as keyof typeof colors] || "hsl(var(--muted))",
    }));
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = isRTL ? {
      new: "جديد",
      processing: "قيد المعالجة",
      completed: "مكتمل",
      cancelled: "ملغى",
      reserved: "محجوز",
    } : {
      new: "New",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      reserved: "Reserved",
    };
    return labels[status] || status;
  };

  // Top selling brands
  const topBrands = () => {
    const brandCounts: Record<string, number> = {};
    ordersData?.filter(o => o.status === "completed").forEach(order => {
      const brand = order.cars?.brand_id;
      if (brand) {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    });
    return Object.entries(brandCounts)
      .map(([brandId, count]) => ({
        name: brandsData?.find(b => b.id === brandId)?.name_ar || brandId,
        sales: count,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  // Calculate KPIs
  const totalRevenue = paymentsData?.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalOrders = ordersData?.length || 0;
  const completedOrders = ordersData?.filter(o => o.status === "completed").length || 0;
  const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0";
  const avgOrderValue = completedOrders > 0 ? (totalRevenue / completedOrders).toFixed(0) : "0";

  // AI Insights
  const generateAIInsights = async () => {
    setIsLoadingAI(true);
    try {
      const analyticsData = {
        totalRevenue,
        totalOrders,
        completedOrders,
        conversionRate,
        avgOrderValue,
        totalCars: carsData?.length || 0,
        availableCars: carsData?.filter(c => c.status === "available").length || 0,
        soldCars: carsData?.filter(c => c.status === "sold").length || 0,
        topBrands: topBrands(),
        monthlyTrend: monthlyRevenue(),
        showroomName: settings?.showroom_name || "معرض السيارات",
      };

      const response = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `أنت محلل بيانات متخصص في قطاع السيارات. قم بتحليل البيانات التالية لمعرض "${analyticsData.showroomName}" وقدم رؤى وتوصيات احترافية:

البيانات:
- إجمالي الإيرادات: ${analyticsData.totalRevenue.toLocaleString()} ر.س
- إجمالي الطلبات: ${analyticsData.totalOrders}
- الطلبات المكتملة: ${analyticsData.completedOrders}
- معدل التحويل: ${analyticsData.conversionRate}%
- متوسط قيمة الطلب: ${analyticsData.avgOrderValue} ر.س
- السيارات المتاحة: ${analyticsData.availableCars} من ${analyticsData.totalCars}
- أفضل العلامات التجارية: ${JSON.stringify(analyticsData.topBrands)}
- الاتجاه الشهري: ${JSON.stringify(analyticsData.monthlyTrend)}

قدم:
1. ملخص تنفيذي للأداء
2. نقاط القوة والضعف
3. توصيات لتحسين المبيعات
4. اقتراحات للحملات التسويقية`,
        },
      });

      if (response.error) throw response.error;
      setAiInsights(response.data.response);
    } catch (error) {
      toast({
        variant: "destructive",
        title: isRTL ? "فشل تحليل البيانات" : "Failed to analyze data",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          {isRTL ? "التحليلات المتقدمة" : "Advanced Analytics"}
        </h2>
        <Button onClick={generateAIInsights} disabled={isLoadingAI} className="gap-2">
          {isLoadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
          {isRTL ? "تحليل بالذكاء الاصطناعي" : "AI Analysis"}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "إجمالي الإيرادات" : "Total Revenue"}</p>
                <p className="text-lg font-bold">{totalRevenue.toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "إجمالي الطلبات" : "Total Orders"}</p>
                <p className="text-lg font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "معدل التحويل" : "Conversion Rate"}</p>
                <p className="text-lg font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Car className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "متوسط قيمة الطلب" : "Avg Order Value"}</p>
                <p className="text-lg font-bold">{Number(avgOrderValue).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              {isRTL ? "تحليل الذكاء الاصطناعي" : "AI Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
              {aiInsights}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? "الإيرادات الشهرية" : "Monthly Revenue"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} ${isRTL ? "ر.س" : "SAR"}`, isRTL ? "الإيرادات" : "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? "الطلبات حسب الحالة" : "Orders by Status"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ordersByStatus().map((entry, index) => (
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
            </div>
          </CardContent>
        </Card>

        {/* Top Brands */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? "أفضل العلامات التجارية مبيعاً" : "Top Selling Brands"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBrands()} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, isRTL ? "المبيعات" : "Sales"]}
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
