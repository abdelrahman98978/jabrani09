import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Loader2, LayoutDashboard, Tag, Settings, ShoppingCart, Users, BarChart3, MessageSquare, Sparkles, CreditCard, Shield, Mail, Package, Megaphone, TrendingUp, Building2, AlertTriangle, UserCheck, Star, CalendarClock } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useSettings } from "@/hooks/useSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { data: settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    const ALLOWED_ADMIN_EMAIL = "abdo12uk@gmail.com";
    
    const checkAdminAccess = async (userEmail: string | undefined, userId: string) => {
      if (userEmail !== ALLOWED_ADMIN_EMAIL) {
        toast({ variant: "destructive", title: isRTL ? "غير مصرح" : "Unauthorized", description: isRTL ? "ليس لديك صلاحية الوصول" : "You don't have access" });
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

  if (!user || isAdmin === null) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: "dashboard", label: isRTL ? "نظرة عامة" : "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: isRTL ? "التحليلات المتقدمة" : "Advanced Analytics", icon: TrendingUp },
    { id: "cars", label: isRTL ? "السيارات" : "Cars", icon: Car },
    { id: "brands", label: isRTL ? "الماركات" : "Brands", icon: Tag },
    { id: "accessories", label: isRTL ? "الإكسسوارات" : "Accessories", icon: Package },
    { id: "orders", label: isRTL ? "الطلبات" : "Orders", icon: ShoppingCart },
    { id: "customers", label: isRTL ? "العملاء" : "Customers", icon: Users },
    { id: "payments", label: isRTL ? "المدفوعات" : "Payments", icon: CreditCard },
    { id: "promotions", label: isRTL ? "العروض" : "Promotions", icon: Sparkles },
    { id: "marketing", label: isRTL ? "التسويق الذكي" : "AI Marketing", icon: Megaphone },
    { id: "email_campaigns", label: isRTL ? "حملات البريد" : "Email Campaigns", icon: Mail },
    { id: "subscribers", label: isRTL ? "المشتركين" : "Subscribers", icon: UserCheck },
    { id: "reviews", label: isRTL ? "المراجعات" : "Reviews", icon: Star },
    { id: "test_drives", label: isRTL ? "تجارب القيادة" : "Test Drives", icon: CalendarClock },
    { id: "moderators", label: isRTL ? "المشرفين" : "Moderators", icon: Shield },
    { id: "messages", label: isRTL ? "الرسائل" : "Messages", icon: MessageSquare },
    { id: "reports", label: isRTL ? "التقارير" : "Reports", icon: BarChart3 },
    { id: "bank_settings", label: isRTL ? "إعدادات البنك" : "Bank Settings", icon: Building2 },
    { id: "settings", label: isRTL ? "الإعدادات" : "Settings", icon: Settings },
  ];

  const activeTabConfig = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const tabDescriptions: Record<string, string> = {
    dashboard: isRTL
      ? "نظرة عامة على أداء المعرض والملخص السريع للمؤشرات"
      : "High level overview of showroom performance and key metrics",
    analytics: isRTL ? "تحليلات متقدمة بالذكاء الاصطناعي للمبيعات والطلبات" : "Advanced AI-powered analytics for sales and orders",
    cars: isRTL ? "إدارة السيارات، الأسعار، الصور والحالة" : "Manage cars, pricing, images and status",
    brands: isRTL ? "إدارة الماركات وترتيب ظهورها" : "Manage brands and their ordering",
    accessories: isRTL ? "إدارة الإكسسوارات والعناصر الإضافية" : "Manage accessories and add-ons",
    orders: isRTL ? "متابعة الطلبات وحالتها" : "Track orders and their status",
    customers: isRTL ? "بيانات العملاء وسجل التفاعل" : "Customer records and interactions",
    payments: isRTL ? "مدفوعات العملاء وطرق السداد" : "Customer payments and payment methods",
    promotions: isRTL ? "العروض والخصومات والكوبونات" : "Promotions, discounts and coupons",
    marketing: isRTL ? "التسويق الذكي وتوليد الحملات بالذكاء الاصطناعي" : "AI-powered marketing and campaign generation",
    email_campaigns: isRTL ? "حملات البريد الإلكتروني وتقارير الإرسال" : "Email campaigns and sending reports",
    subscribers: isRTL ? "إدارة مشتركي النشرة البريدية" : "Manage newsletter subscribers",
    reviews: isRTL ? "إدارة مراجعات وتقييمات العملاء" : "Manage customer reviews and ratings",
    test_drives: isRTL ? "إدارة حجوزات تجربة القيادة" : "Manage test drive bookings",
    moderators: isRTL ? "صلاحيات المشرفين وإدارة المستخدمين" : "Moderators and admin permissions",
    messages: isRTL ? "رسائل العملاء واستفساراتهم" : "Customer messages and inquiries",
    reports: isRTL ? "تقارير الأداء والمبيعات" : "Performance and sales reports",
    bank_settings: isRTL ? "إعدادات الحساب البنكي للتحويلات" : "Bank account settings for transfers",
    settings: isRTL ? "إعدادات المعرض والهوية" : "Showroom settings and branding",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* New Admin Header with Logo and Stats */}
      <AdminHeader onLogout={handleLogout} userEmail={user.email} />

      <div className="container mx-auto px-4 py-8">
        {/* Settings Alert */}
        {!settingsLoading && (!settings?.showroom_name || !settings?.phone || !settings?.bank_name) && (
          <Alert variant="destructive" className="mb-6 cursor-pointer" onClick={() => setActiveTab("settings")}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{isRTL ? "⚠️ إعدادات ناقصة" : "⚠️ Missing Settings"}</AlertTitle>
            <AlertDescription>
              {isRTL 
                ? "بعض الإعدادات الأساسية غير مكتملة (اسم المعرض، الهاتف، إعدادات البنك). انقر هنا لإكمالها."
                : "Some essential settings are missing (Showroom name, Phone, Bank settings). Click here to complete them."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 lg:grid-cols-[280px,1fr] items-start">
          {/* Sidebar / Navigation */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-card/90 border border-border/60 shadow-card p-4 glass-effect">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? "المستخدم" : "Signed in as"}
                  </span>
                  <span className="text-sm font-semibold truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
                <div className="px-2 py-1 rounded-full bg-secondary text-[10px] font-medium tracking-wide uppercase">
                  {isRTL ? "مدير" : "Admin"}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{isRTL ? "لوحة تحكم متقدمة" : "Advanced management console"}</span>
              </div>
            </div>

            <nav className="rounded-2xl bg-card/90 border border-border/60 shadow-card p-2 glass-effect max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? "bg-gradient-primary text-primary-foreground shadow-primary-hover"
                          : "hover:bg-secondary/80 text-muted-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${
                          isActive ? "border-primary-foreground/40 bg-background/10" : "border-border/60 bg-background/60"
                        }`}>
                          <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </span>
                        <span className="font-medium">{tab.label}</span>
                      </span>
                      {isActive && (
                        <span className="h-5 w-5 rounded-full border border-primary-foreground/40 bg-background/30 flex items-center justify-center text-[9px]">
                          ●
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-4">
            <div className="rounded-2xl bg-card/90 border border-border/60 shadow-card p-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = activeTabConfig.icon;
                  return (
                    <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                  );
                })()}
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    {activeTabConfig.label}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tabDescriptions[activeTabConfig.id]}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card/95 border border-border/60 shadow-card p-4 lg:p-5">
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
