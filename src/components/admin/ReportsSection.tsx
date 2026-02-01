import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Car, Users, ShoppingCart, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, subMonths } from "date-fns";
import { ar } from "date-fns/locale";

const ReportsSection = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [period, setPeriod] = useState("week");

  const { data: salesReport } = useQuery({
    queryKey: ["sales-report", period],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("*, cars(name_ar, price)")
        .eq("status", "completed")
        .order("created_at", { ascending: true });

      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "completed");

      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Group by period
      let chartData: { name: string; revenue: number; orders: number }[] = [];
      
      if (period === "week") {
        const days = eachDayOfInterval({
          start: subDays(new Date(), 6),
          end: new Date(),
        });
        chartData = days.map(day => {
          const dayOrders = orders?.filter(o => 
            format(new Date(o.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
          ) || [];
          return {
            name: format(day, "EEE", { locale: isRTL ? ar : undefined }),
            revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
            orders: dayOrders.length,
          };
        });
      } else if (period === "month") {
        const days = eachDayOfInterval({
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date()),
        });
        chartData = days.map(day => {
          const dayOrders = orders?.filter(o => 
            format(new Date(o.created_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
          ) || [];
          return {
            name: format(day, "d"),
            revenue: dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
            orders: dayOrders.length,
          };
        });
      } else {
        const months = eachMonthOfInterval({
          start: subMonths(new Date(), 11),
          end: new Date(),
        });
        chartData = months.map(month => {
          const monthOrders = orders?.filter(o => 
            format(new Date(o.created_at), "yyyy-MM") === format(month, "yyyy-MM")
          ) || [];
          return {
            name: format(month, "MMM", { locale: isRTL ? ar : undefined }),
            revenue: monthOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
            orders: monthOrders.length,
          };
        });
      }

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        chartData,
        orders: orders || [],
      };
    },
  });

  const { data: carsReport } = useQuery({
    queryKey: ["cars-report"],
    queryFn: async () => {
      const { data: cars } = await supabase
        .from("cars")
        .select("*, brands(name_ar)")
        .order("views_count", { ascending: false });

      const topViewed = cars?.slice(0, 5) || [];
      
      const statusBreakdown = [
        { name: isRTL ? "متاحة" : "Available", value: cars?.filter(c => c.status === "available").length || 0, color: "hsl(var(--primary))" },
        { name: isRTL ? "محجوزة" : "Reserved", value: cars?.filter(c => c.status === "reserved").length || 0, color: "hsl(45 80% 60%)" },
        { name: isRTL ? "مباعة" : "Sold", value: cars?.filter(c => c.status === "sold").length || 0, color: "hsl(142 76% 36%)" },
      ];

      const brandBreakdown = cars?.reduce((acc: any, car) => {
        const brandName = car.brands?.name_ar || (isRTL ? "غير محدد" : "Unknown");
        acc[brandName] = (acc[brandName] || 0) + 1;
        return acc;
      }, {});

      const brandData = Object.entries(brandBreakdown || {}).map(([name, value]) => ({ name, value: value as number }));

      return {
        total: cars?.length || 0,
        topViewed,
        statusBreakdown,
        brandData,
      };
    },
  });

  const { data: customersReport } = useQuery({
    queryKey: ["customers-report"],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .order("total_purchases", { ascending: false });

      const typeBreakdown = [
        { name: isRTL ? "جديد" : "New", value: customers?.filter(c => c.customer_type === "new").length || 0, color: "hsl(217 91% 60%)" },
        { name: isRTL ? "محتمل" : "Potential", value: customers?.filter(c => c.customer_type === "potential").length || 0, color: "hsl(45 93% 47%)" },
        { name: isRTL ? "دائم" : "Regular", value: customers?.filter(c => c.customer_type === "regular").length || 0, color: "hsl(142 76% 36%)" },
        { name: "VIP", value: customers?.filter(c => c.customer_type === "vip").length || 0, color: "hsl(280 65% 60%)" },
      ];

      const topCustomers = customers?.filter(c => Number(c.total_purchases) > 0).slice(0, 5) || [];

      return {
        total: customers?.length || 0,
        typeBreakdown,
        topCustomers,
      };
    },
  });

  const { data: messagesReport } = useQuery({
    queryKey: ["messages-report", period],
    queryFn: async () => {
      const { data: messages } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: true });

      const { data: customers } = await supabase
        .from("customers")
        .select("id, phone, email");

      const matchCustomer = (msg: any) =>
        customers?.some(
          (c) => (c.phone && c.phone === msg.phone) || (msg.email && c.email && c.email === msg.email)
        ) ?? false;

      const now = new Date();
      let buckets: { label: string; open: number; in_progress: number; closed: number; converted: number }[] = [];

      if (period === "week") {
        const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
        buckets = days.map((day) => {
          const label = format(day, "EEE", { locale: isRTL ? ar : undefined });
          const dayKey = format(day, "yyyy-MM-dd");
          const dayMessages = messages?.filter(
            (m) => format(new Date(m.created_at), "yyyy-MM-dd") === dayKey
          ) || [];
          return {
            label,
            open: dayMessages.filter((m) => m.status === "new").length,
            in_progress: dayMessages.filter((m) => m.status === "in_progress").length,
            closed: dayMessages.filter((m) => m.status === "closed").length,
            converted: dayMessages.filter((m) => matchCustomer(m)).length,
          };
        });
      } else if (period === "month") {
        const days = eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });
        buckets = days.map((day) => {
          const label = format(day, "d");
          const dayKey = format(day, "yyyy-MM-dd");
          const dayMessages = messages?.filter(
            (m) => format(new Date(m.created_at), "yyyy-MM-dd") === dayKey
          ) || [];
          return {
            label,
            open: dayMessages.filter((m) => m.status === "new").length,
            in_progress: dayMessages.filter((m) => m.status === "in_progress").length,
            closed: dayMessages.filter((m) => m.status === "closed").length,
            converted: dayMessages.filter((m) => matchCustomer(m)).length,
          };
        });
      } else {
        const months = eachMonthOfInterval({ start: subMonths(now, 11), end: now });
        buckets = months.map((month) => {
          const label = format(month, "MMM", { locale: isRTL ? ar : undefined });
          const monthKey = format(month, "yyyy-MM");
          const monthMessages = messages?.filter(
            (m) => format(new Date(m.created_at), "yyyy-MM") === monthKey
          ) || [];
          return {
            label,
            open: monthMessages.filter((m) => m.status === "new").length,
            in_progress: monthMessages.filter((m) => m.status === "in_progress").length,
            closed: monthMessages.filter((m) => m.status === "closed").length,
            converted: monthMessages.filter((m) => matchCustomer(m)).length,
          };
        });
      }

      const totals = buckets.reduce(
        (acc, b) => {
          acc.open += b.open;
          acc.in_progress += b.in_progress;
          acc.closed += b.closed;
          acc.converted += b.converted;
          return acc;
        },
        { open: 0, in_progress: 0, closed: 0, converted: 0 }
      );

      const totalMessages = totals.open + totals.in_progress + totals.closed;
      const conversionRate = totalMessages > 0 ? (totals.converted / totalMessages) * 100 : 0;

      return { buckets, totals, conversionRate };
    },
  });

  const exportReport = (type: string) => {
    let data: any[] = [];
    let filename = "";

    if (type === "sales") {
      data = salesReport?.orders?.map(o => ({
        [isRTL ? "رقم الطلب" : "Order Number"]: o.order_number,
        [isRTL ? "السيارة" : "Car"]: o.cars?.name_ar || "-",
        [isRTL ? "المبلغ" : "Amount"]: o.total_amount,
        [isRTL ? "التاريخ" : "Date"]: format(new Date(o.created_at), "PPP", { locale: isRTL ? ar : undefined }),
      })) || [];
      filename = `sales-report-${format(new Date(), "yyyy-MM-dd")}`;
    } else if (type === "cars") {
      data = carsReport?.topViewed?.map(c => ({
        [isRTL ? "السيارة" : "Car"]: c.name_ar,
        [isRTL ? "الماركة" : "Brand"]: c.brands?.name_ar || "-",
        [isRTL ? "السعر" : "Price"]: c.price,
        [isRTL ? "المشاهدات" : "Views"]: c.views_count || 0,
        [isRTL ? "الحالة" : "Status"]: c.status,
      })) || [];
      filename = `cars-report-${format(new Date(), "yyyy-MM-dd")}`;
    }

    // Create CSV
    if (data.length > 0) {
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row => Object.values(row).join(",")).join("\n");
      const csv = `${headers}\n${rows}`;
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          {isRTL ? "التقارير والتحليلات" : "Reports & Analytics"}
        </h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{isRTL ? "آخر 7 أيام" : "Last 7 Days"}</SelectItem>
            <SelectItem value="month">{isRTL ? "هذا الشهر" : "This Month"}</SelectItem>
            <SelectItem value="year">{isRTL ? "هذه السنة" : "This Year"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "إجمالي الإيرادات" : "Total Revenue"}</p>
                <p className="text-lg font-bold">{(salesReport?.totalRevenue || 0).toLocaleString()} {isRTL ? "ر.س" : "SAR"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ShoppingCart className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "الطلبات المكتملة" : "Completed Orders"}</p>
                <p className="text-lg font-bold">{salesReport?.totalOrders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "السيارات المتاحة" : "Available Cars"}</p>
                <p className="text-lg font-bold">{carsReport?.statusBreakdown?.find(s => s.name === (isRTL ? "متاحة" : "Available"))?.value || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "العملاء" : "Customers"}</p>
                <p className="text-lg font-bold">{customersReport?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart & Messages Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {isRTL ? "مخطط المبيعات" : "Sales Chart"}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportReport("sales")}>
              <Download className="h-4 w-4 ml-1" />
              {isRTL ? "تصدير" : "Export"}
            </Button>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesReport?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" name={isRTL ? "الإيرادات" : "Revenue"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {isRTL ? "تحليل الرسائل" : "Messages Analysis"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">{isRTL ? "مفتوحة" : "Open"}</p>
                <p className="font-semibold">{messagesReport?.totals.open || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{isRTL ? "قيد المتابعة" : "In progress"}</p>
                <p className="font-semibold">{messagesReport?.totals.in_progress || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{isRTL ? "مغلقة" : "Closed"}</p>
                <p className="font-semibold">{messagesReport?.totals.closed || 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "نسبة تحويل الرسائل إلى عملاء:" : "Message-to-customer conversion:"}
              <span className="font-semibold ml-1">
                {messagesReport ? messagesReport.conversionRate.toFixed(1) : "0.0"}%
              </span>
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesReport?.buckets || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="open" stroke="#f97316" name={isRTL ? "مفتوحة" : "Open"} />
                <Line type="monotone" dataKey="in_progress" stroke="#eab308" name={isRTL ? "قيد المتابعة" : "In progress"} />
                <Line type="monotone" dataKey="closed" stroke="#22c55e" name={isRTL ? "مغلقة" : "Closed"} />
                <Line type="monotone" dataKey="converted" stroke="#3b82f6" name={isRTL ? "مرتبطة بعميل" : "Linked to customer"} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isRTL ? "تقرير المبيعات" : "Sales Report"}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => exportReport("sales")}>
            <Download className="h-4 w-4 ml-1" />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesReport?.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `${value.toLocaleString()} ${isRTL ? "ر.س" : "SAR"}` : value,
                    name === "revenue" ? (isRTL ? "الإيرادات" : "Revenue") : (isRTL ? "الطلبات" : "Orders"),
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cars and Customers Reports */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Viewed Cars */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">{isRTL ? "أكثر السيارات مشاهدة" : "Most Viewed Cars"}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => exportReport("cars")}>
              <Download className="h-4 w-4 ml-1" />
              {isRTL ? "تصدير" : "Export"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {carsReport?.topViewed?.map((car, index) => (
                <div key={car.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <span className="text-lg font-bold text-primary w-8">{index + 1}</span>
                  <img src={car.main_image || "/placeholder.svg"} alt="" className="h-12 w-16 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{car.name_ar}</p>
                    <p className="text-xs text-muted-foreground">{car.brands?.name_ar}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{car.views_count || 0}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? "مشاهدة" : "views"}</p>
                  </div>
                </div>
              ))}
              {(!carsReport?.topViewed || carsReport.topViewed.length === 0) && (
                <p className="text-center text-muted-foreground py-4">{isRTL ? "لا توجد بيانات" : "No data"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{isRTL ? "تصنيف العملاء" : "Customer Types"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customersReport?.typeBreakdown?.filter(t => t.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customersReport?.typeBreakdown?.map((entry, index) => (
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
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {customersReport?.typeBreakdown?.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsSection;
