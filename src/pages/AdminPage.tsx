import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Car, Loader2, LayoutDashboard, Tag, Settings, ShoppingCart,
  Users, BarChart3, MessageSquare, Sparkles, CreditCard,
  Shield, Mail, Package, Megaphone, TrendingUp, Building2,
  AlertTriangle, UserCheck, Star, CalendarClock, ChevronRight, Menu, X
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useSettings } from "@/hooks/useSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

import AdminHeader from "@/components/admin/AdminHeader";
import DashboardOverview from "@/components/admin/DashboardOverview";
import CarsManagement from "@/components/admin/CarsManagement";
import BrandsManagement from "@/components/admin/BrandsManagement";
import OrdersManagement from "@/components/admin/OrdersManagement";
import CustomersManagement from "@/components/admin/CustomersManagement";
import PromotionsManagement from "@/components/admin/PromotionsManagement";
import PaymentsManagement from "@/components/admin/PaymentsManagement";
import ReportsSection from "@/components/admin/ReportsSection";
import SettingsSection from "@/components/admin/SettingsSection";
import MessagesSection from "@/components/admin/MessagesSection";
import ModeratorsManagement from "@/components/admin/ModeratorsManagement";
import EmailCampaignsManagement from "@/components/admin/EmailCampaignsManagement";
import AccessoriesManagement from "@/components/admin/AccessoriesManagement";
import MarketingAI from "@/components/admin/MarketingAI";
import AdvancedAnalytics from "@/components/admin/AdvancedAnalytics";
import BankSettings from "@/components/admin/BankSettings";
import SubscribersManagement from "@/components/admin/SubscribersManagement";
import ReviewsManagement from "@/components/admin/ReviewsManagement";
import TestDriveManagement from "@/components/admin/TestDriveManagement";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { data: settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    const ALLOWED_ADMIN_EMAIL = "abdo12uk@gmail.com";

    const checkAdminAccess = async (userEmail: string | undefined, userId: string) => {
      // Allow the specific email or check in database
      if (userEmail === ALLOWED_ADMIN_EMAIL) {
        setIsAdmin(true);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          variant: "destructive",
          title: isRTL ? "غير مصرح" : "Unauthorized",
          description: isRTL ? "ليس لديك صلاحية الوصول للوحة التحكم" : "You don't have access to the dashboard"
        });
        navigate("/");
        return;
      }
      setIsAdmin(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminAccess(session.user.email, session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminAccess(session.user.email, session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, isRTL]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user || isAdmin === null) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary/40" />
        </div>
      </div>
      <p className="text-sm font-black text-muted-foreground animate-pulse tracking-widest uppercase">
        {isRTL ? "جاري التحقق من الصلاحيات..." : "Verifying Permissions..."}
      </p>
    </div>
  );

  if (!isAdmin) return null;

  const tabs = [
    {
      section: isRTL ? "الرئيسية" : "Main", items: [
        { id: "dashboard", label: isRTL ? "نظرة عامة" : "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: isRTL ? "التحليلات" : "Analytics", icon: TrendingUp },
      ]
    },
    {
      section: isRTL ? "المخزون" : "Inventory", items: [
        { id: "cars", label: isRTL ? "السيارات" : "Cars", icon: Car },
        { id: "brands", label: isRTL ? "الماركات" : "Brands", icon: Tag },
        { id: "accessories", label: isRTL ? "الإكسسوارات" : "Accessories", icon: Package },
      ]
    },
    {
      section: isRTL ? "المبيعات" : "Sales", items: [
        { id: "orders", label: isRTL ? "الطلبات" : "Orders", icon: ShoppingCart },
        { id: "customers", label: isRTL ? "العملاء" : "Customers", icon: Users },
        { id: "payments", label: isRTL ? "المدفوعات" : "Payments", icon: CreditCard },
        { id: "promotions", label: isRTL ? "العروض" : "Promotions", icon: Sparkles },
      ]
    },
    {
      section: isRTL ? "التسويق" : "Marketing", items: [
        { id: "marketing", label: isRTL ? "التسويق بالذكاء الاصطناعي" : "AI Marketing", icon: Megaphone },
        { id: "email_campaigns", label: isRTL ? "حملات البريد" : "Email Campaigns", icon: Mail },
        { id: "subscribers", label: isRTL ? "المشتركين" : "Subscribers", icon: UserCheck },
      ]
    },
    {
      section: isRTL ? "أخرى" : "Other", items: [
        { id: "reviews", label: isRTL ? "المراجعات" : "Reviews", icon: Star },
        { id: "test_drives", label: isRTL ? "تجارب القيادة" : "Test Drives", icon: CalendarClock },
        { id: "messages", label: isRTL ? "الرسائل" : "Messages", icon: MessageSquare },
        { id: "reports", label: isRTL ? "التقارير" : "Reports", icon: BarChart3 },
      ]
    },
    {
      section: isRTL ? "الإعدادات" : "Settings", items: [
        { id: "moderators", label: isRTL ? "المشرفين" : "Moderators", icon: Shield },
        { id: "bank_settings", label: isRTL ? "البنك" : "Bank", icon: Building2 },
        { id: "settings", label: isRTL ? "الإعدادات" : "Settings", icon: Settings },
      ]
    },
  ];

  const allTabItems = tabs.flatMap(t => t.items);
  const activeTabConfig = allTabItems.find((t) => t.id === activeTab) ?? allTabItems[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] text-foreground flex flex-col">
      <AdminHeader onLogout={handleLogout} userEmail={user.email}>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="me-2 hidden md:flex items-center gap-2 border-primary/20 hover:bg-primary/5"
        >
          <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
          {isRTL ? "العودة للرئيسية" : "Back to Home"}
        </Button>
      </AdminHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Modern Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 80 }}
          className="relative z-40 bg-card/50 backdrop-blur-xl border-e border-border/40 hidden lg:flex flex-col transition-all duration-300"
        >
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
            {tabs.map((section, sidx) => (
              <div key={sidx} className="mb-6">
                {isSidebarOpen && (
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                    {section.section}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative ${activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <item.icon className={`h-5 w-5 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {isSidebarOpen && (
                        <span className="text-sm font-bold flex-1 text-start">{item.label}</span>
                      )}
                      {activeTab === item.id && isSidebarOpen && (
                        <motion.div layoutId="active-indicator" className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Toggle Sidebar Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-background border border-border shadow-md z-50"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronRight className={`h-3 w-3 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Background elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header Details */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
                    <Sparkles className="h-3 w-3" />
                    {activeTabConfig.id === 'dashboard' ? (isRTL ? "مرحباً بك مجدداً" : "Welcome Back") : (isRTL ? "إدارة القسم" : "Section Management")}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                    {activeTabConfig.label}
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </h1>
                </div>

                {/* Quick Stats or info could go here */}
                {!settingsLoading && (!settings?.showroom_name || !settings?.phone) && (
                  <Alert variant="destructive" className="max-w-md border-2 animate-bounce bg-destructive/5 cursor-pointer" onClick={() => setActiveTab("settings")}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                        <AlertTitle className="font-black text-xs uppercase">{isRTL ? "تنبيه هام" : "Urgent Alert"}</AlertTitle>
                        <AlertDescription className="text-xs">
                          {isRTL ? "الإعدادات الأساسية ناقصة!" : "Missing essential settings!"}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>

              {/* Tab Content with Framer Motion */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card/50 backdrop-blur-md rounded-[32px] border border-border/40 shadow-2xl overflow-hidden min-h-[600px]">
                    <div className="p-1">
                      {activeTab === "dashboard" && <DashboardOverview />}
                      {activeTab === "analytics" && <AdvancedAnalytics />}
                      {activeTab === "cars" && <CarsManagement />}
                      {activeTab === "brands" && <BrandsManagement />}
                      {activeTab === "accessories" && <AccessoriesManagement />}
                      {activeTab === "orders" && <OrdersManagement />}
                      {activeTab === "customers" && <CustomersManagement />}
                      {activeTab === "payments" && <PaymentsManagement />}
                      {activeTab === "promotions" && <PromotionsManagement />}
                      {activeTab === "marketing" && <MarketingAI />}
                      {activeTab === "email_campaigns" && <EmailCampaignsManagement />}
                      {activeTab === "subscribers" && <SubscribersManagement />}
                      {activeTab === "reviews" && <ReviewsManagement />}
                      {activeTab === "test_drives" && <TestDriveManagement />}
                      {activeTab === "moderators" && <ModeratorsManagement />}
                      {activeTab === "messages" && <MessagesSection />}
                      {activeTab === "reports" && <ReportsSection />}
                      {activeTab === "bank_settings" && <BankSettings />}
                      {activeTab === "settings" && <SettingsSection />}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Trigger */}
      <div className="lg:hidden fixed bottom-6 left-6 z-50">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} bottom-0 w-[280px] bg-background p-6 shadow-2xl`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col h-full uppercase overflow-y-auto scrollbar-hide">
                <div className="flex items-center gap-3 mb-8 border-b pb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="font-black tracking-tighter">{isRTL ? "لوحة المدير" : "Admin Panel"}</span>
                </div>
                {tabs.map((section, sidx) => (
                  <div key={sidx} className="mb-4">
                    <h3 className="text-[10px] font-black text-muted-foreground/50 mb-2 tracking-widest">{section.section}</h3>
                    <div className="flex flex-col gap-1">
                      {section.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary font-black' : 'text-muted-foreground'}`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
