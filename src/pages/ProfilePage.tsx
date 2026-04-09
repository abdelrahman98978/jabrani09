import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSettings } from "@/hooks/useSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvoicePDF from "@/components/InvoicePDF";
import CarCard, { mapCarToCardData } from "@/components/CarCard";
import ReferralCard from "@/components/ReferralCard";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Loader2,
  LogOut,
  ShoppingCart,
  Heart,
  Eye,
  Clock,
  Shield,
  Edit3,
  Settings,
  Bell,
  CreditCard,
  Car,
  Star,
  Gift,
  Trophy,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  FileText,
  Trash2,
  Plus,
  Home,
  Building,
  Key,
  Lock,
  Smartphone,
  CheckCheck,
  AlertTriangle,
  Package,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at?: string;
  referral_code?: string | null;
  total_referrals?: number;
  referral_earnings?: number;
}

interface Address {
  id: string;
  user_id: string;
  label: string;
  city: string | null;
  district: string | null;
  street: string | null;
  building_number: string | null;
  postal_code: string | null;
  is_default: boolean;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  title_ar: string | null;
  message: string;
  message_ar: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const UserOrdersSection = ({ user, isRTL }: { user: SupabaseUser | null; isRTL: boolean }) => {
  const { toast } = useToast();
  const { data: settings } = useSettings();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.rpc("get_my_orders");
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusLabel = (status: string | null) => {
    const map: Record<string, string> = {
      new: isRTL ? "جديد" : "New",
      processing: isRTL ? "قيد المعالجة" : "Processing",
      reserved: isRTL ? "محجوز" : "Reserved",
      completed: isRTL ? "مكتمل" : "Completed",
      cancelled: isRTL ? "ملغى" : "Cancelled",
    };
    return map[status || ""] || (status || "-");
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="py-32 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-32 text-center border border-white/5 bg-surface-low">
        <ShoppingCart className="h-16 w-16 text-white/5 mx-auto mb-8" />
        <h3 className="text-xl uppercase tracking-[0.4em] text-white/40 mb-8">No Acquisitions Yet</h3>
        <Link to="/cars" className="inline-block px-12 py-5 bg-primary text-black text-[11px] uppercase tracking-[0.4em] font-black hover:bg-white transition-all duration-700">
          Begin Journey
        </Link>
      </div>
    );
  }

  const steps = [
    { id: "new", labelAr: "جديد", labelEn: "New" },
    { id: "processing", labelAr: "قيد المعالجة", labelEn: "Processing" },
    { id: "reserved", labelAr: "محجوز", labelEn: "Reserved" },
    { id: "completed", labelAr: "مكتمل", labelEn: "Completed" },
  ];

  return (
    <div className="space-y-8">
      {orders.map((order: any) => {
        const activeIndex = Math.max(0, steps.findIndex((s) => s.id === order.status));
        const progress = ((activeIndex + 1) / steps.length) * 100;

        return (
          <div key={order.id} className="group bg-surface-low border border-white/5 overflow-hidden">
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex flex-wrap items-center justify-between gap-8 border-b border-white/5 pb-8">
                <div>
                   <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">{isRTL ? "مرجع المعاملة" : "Transaction Ref"}</p>
                   <p className="text-sm font-bold text-white tracking-widest">#{order.order_number}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 rounded-none px-4 py-1 uppercase text-[10px] tracking-widest">
                    {getStatusLabel(order.status)}
                  </Badge>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {order.cars && (
                <div className="flex flex-col md:flex-row items-start lg:items-center gap-12">
                   <div className="relative group/img overflow-hidden w-full md:w-64 aspect-[16/9]">
                     <img
                       src={order.cars.main_image || "/placeholder.svg"}
                       alt={order.cars.name_ar}
                       className="w-full h-full object-cover grayscale opacity-50 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-1000 scale-100 group-hover/img:scale-110"
                     />
                   </div>
                   <div className="flex-1 space-y-2">
                     <h4 className="text-2xl font-black tracking-tight text-white uppercase">{isRTL ? order.cars.name_ar : order.cars.name_en || order.cars.name_ar}</h4>
                     <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">{order.cars.model} • {order.cars.year}</p>
                     <p className="text-xl font-bold text-primary tracking-tighter mt-4">
                       {Number(order.total_amount).toLocaleString()} {(settings as any)?.currency_symbol || (isRTL ? "ج.س" : "SDG")}
                     </p>
                   </div>
                   <div className="flex flex-col gap-6 items-end">
                      <Link to={`/orders/${order.id}`} className="text-[10px] uppercase tracking-[0.4em] font-black text-white hover:text-primary transition-colors flex items-center gap-3">
                         {isRTL ? "مراجعة التفاصيل" : "Review Details"}
                         <ArrowRight className="h-3 w-3" />
                      </Link>
                      {order.payment_status === "paid" && (
                         <div className="scale-75 origin-right">
                           <InvoicePDF order={{ ...order, customers: order.customers, cars: order.cars }} />
                         </div>
                      )}
                   </div>
                </div>
              )}

              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.4em] text-white/20">
                  {steps.map((step, idx) => (
                    <span key={step.id} className={idx <= activeIndex ? "text-primary font-black" : ""}>
                      {isRTL ? step.labelAr : step.labelEn}
                    </span>
                  ))}
                </div>
                <div className="h-[1px] bg-white/5 relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                     className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone: "" });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({ label: "home", city: "", district: "", street: "", building_number: "", postal_code: "", is_default: false });

  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const defaultTab = searchParams.get("tab") || "profile";

  const { data: ordersCount = 0 } = useQuery({
    queryKey: ["orders-count", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
  });

  const { data: wishlistCars = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ["wishlist-cars-profile", wishlistItems],
    enabled: wishlistItems.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("cars").select("*, brands(name, name_ar)").in("id", wishlistItems);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Notification[];
    },
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("addresses").select("*").eq("user_id", user!.id).order("is_default", { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: isRTL ? "تم التحديث" : "Updated", description: isRTL ? "تم تحديد جميع الإشعارات كمقروءة" : "All notifications marked as read" });
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (address: typeof addressForm) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("addresses").insert({ ...address, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowAddressForm(false);
      setAddressForm({ label: "home", city: "", district: "", street: "", building_number: "", postal_code: "", is_default: false });
      toast({ title: isRTL ? "تم الحفظ" : "Saved", description: isRTL ? "تم إضافة العنوان بنجاح" : "Address added successfully" });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({ title: isRTL ? "تم الحذف" : "Deleted", description: isRTL ? "تم حذف العنوان بنجاح" : "Address deleted successfully" });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) return;
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
      const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({ title: isRTL ? "تم التحديث" : "Updated", description: isRTL ? "تم تحديد العنوان الافتراضي" : "Default address updated" });
    },
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setProfile(data);
        setFormData({ full_name: data.full_name || "", phone: data.phone || "" });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: formData.full_name, phone: formData.phone, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, ...formData } : null);
      setEditMode(false);
      toast({ title: isRTL ? "تم الحفظ" : "Saved", description: isRTL ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: isRTL ? "خطأ" : "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const calculatePoints = () => {
    const signupBonus = 100;
    const referralPoints = (profile?.referral_earnings || 0);
    const orderPoints = ordersCount * 50;
    return signupBonus + referralPoints + orderPoints;
  };

  const getMembershipLevel = () => {
    if (!profile?.created_at) return { level: "bronze", name: isRTL ? "برونزي" : "Bronze" };
    const months = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months >= 12) return { level: "gold", name: isRTL ? "ذهبي" : "Gold" };
    if (months >= 6) return { level: "silver", name: isRTL ? "فضي" : "Silver" };
    return { level: "bronze", name: isRTL ? "برونزي" : "Bronze" };
  };

  const membership = getMembershipLevel();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("car-images").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("car-images").getPublicUrl(filePath);
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      toast({ title: isRTL ? "تم رفع الصورة" : "Avatar uploaded", description: isRTL ? "تم تحديث صورتك الشخصية بنجاح" : "Your avatar has been updated successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: isRTL ? "خطأ" : "Error", description: error.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ variant: "destructive", title: isRTL ? "خطأ" : "Error", description: isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      toast({ title: isRTL ? "تم التحديث" : "Updated", description: isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully" });
    } catch (error: any) {
      toast({ variant: "destructive", title: isRTL ? "خطأ" : "Error", description: error.message });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black selection:bg-primary/30 overflow-x-hidden">
      <Navbar />

      <main className="pt-40 pb-32">
        <div className="container mx-auto px-6 md:px-12">
          
          {/* Sovereign Concierge Header */}
          <section className="mb-24 flex flex-col md:flex-row items-start md:items-end justify-between gap-12 border-b border-white/5 pb-10">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
               className="space-y-4"
             >
                <div className="flex items-center gap-4 text-primary">
                   <div className="w-12 h-[1px] bg-primary/40" />
                   <span className="text-[10px] uppercase tracking-[0.8em] font-black">Authorized Member</span>
                </div>
                <h1 className="text-7xl font-black tracking-tighter uppercase leading-none text-white">
                  The <span className="text-primary italic">Concierge</span> <br /> Interface
                </h1>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1.2, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
               className="flex items-center gap-8"
             >
                <div className="text-end hidden lg:block">
                   <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-2">Member Since</p>
                   <p className="text-sm font-bold text-white tracking-widest">{profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</p>
                </div>
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-1000" />
                   <Avatar className="h-24 w-24 border border-white/10 ring-8 ring-white/5 relative z-10">
                      <AvatarImage src={profile?.avatar_url || ""} className="grayscale contrast-125" />
                      <AvatarFallback className="bg-surface-high text-white font-black text-2xl uppercase tracking-tighter">{profile?.full_name?.[0] || 'U'}</AvatarFallback>
                   </Avatar>
                   <button 
                     onClick={() => avatarInputRef.current?.click()}
                     className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary text-black rounded-full flex items-center justify-center border-4 border-black group-hover:scale-110 transition-all z-20"
                   >
                     {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                   </button>
                   <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
             </motion.div>
          </section>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/5 bg-surface-low divide-x divide-white/5 mb-24">
             {[
               { label: isRTL ? "الاستثمارات" : "Investments", value: ordersCount, icon: ShoppingCart },
               { label: isRTL ? "المجموعة" : "Curated", value: wishlistItems.length, icon: Heart },
               { label: isRTL ? "التنبيهات" : "Dispatch", value: unreadCount, icon: Bell },
               { label: isRTL ? "الرصيد" : "Sovereign Pts", value: calculatePoints(), icon: Star },
             ].map((stat, i) => (
                <div key={i} className="p-10 flex flex-col gap-4 group">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 group-hover:text-primary transition-colors">{stat.label}</p>
                      <stat.icon className="h-4 w-4 text-white/5 group-hover:text-primary/20 transition-colors" />
                   </div>
                   <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                </div>
             ))}
          </div>

          <div className="grid lg:grid-cols-4 gap-20">
             {/* Sovereign Sidebar Navigation */}
             <div className="lg:col-span-1 space-y-12">
                <nav className="flex flex-col gap-6">
                   {[
                     { id: "profile", label: isRTL ? "الهوية" : "Identity", icon: User },
                     { id: "orders", label: isRTL ? "السجل" : "Ledger", icon: ShoppingCart },
                     { id: "notifications", label: isRTL ? "المراسلات" : "Dispatch", icon: Bell },
                     { id: "rewards", label: isRTL ? "المكافآت" : "Privileges", icon: Gift },
                     { id: "addresses", label: isRTL ? "المواقع" : "Stations", icon: MapPin },
                     { id: "security", label: isRTL ? "الثقة" : "Security", icon: Shield },
                   ].map((nav) => (
                      <button 
                        key={nav.id}
                        onClick={() => navigate(`/profile?tab=${nav.id}`)}
                        className={`group flex items-center gap-6 text-[10px] uppercase tracking-[0.5em] font-black transition-all duration-500 ${defaultTab === nav.id ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                      >
                         <nav.icon className={`h-4 w-4 transition-transform ${defaultTab === nav.id ? 'scale-125' : 'group-hover:scale-110'}`} />
                         {nav.label}
                         {nav.id === activeTab && <motion.div layoutId="activeTab" className="ml-auto w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                      </button>
                   ))}
                </nav>

                <div className="pt-12 border-t border-white/5 space-y-8">
                   <div className="p-8 bg-surface-high border border-white/5 space-y-4">
                      <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">{isRTL ? "المستوى السيادي" : "Authority Level"}</p>
                      <h4 className="text-xl font-black text-white uppercase italic">{membership.name} Tier</h4>
                      <Progress value={60} className="h-1 bg-white/5" />
                   </div>
                   <button onClick={handleLogout} className="w-full py-5 border border-white/5 text-[10px] uppercase tracking-[0.4em] font-black text-white/40 hover:text-destructive hover:border-destructive/30 transition-all flex items-center justify-center gap-4">
                      {isRTL ? "إنهاء الجلسة" : "Terminate Session"}
                      <LogOut className="h-3 w-3" />
                   </button>
                </div>
             </div>

             {/* Tab Content Display */}
             <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                   <motion.div
                     key={defaultTab}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                   >
                      {defaultTab === "profile" && (
                         <div className="space-y-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter border-b border-white/5 pb-8">{isRTL ? "إدارة الهوية" : "Identity Management"}</h2>
                            <div className="grid md:grid-cols-2 gap-12">
                               <div className="space-y-8">
                                  <div className="space-y-4">
                                     <label className="text-[10px] uppercase tracking-[0.4em] text-white/20">{isRTL ? "الاسم الكامل" : "Full Sovereign Name"}</label>
                                     <Input 
                                       value={formData.full_name} 
                                       onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                       disabled={!editMode}
                                       className="h-16 bg-surface-low border-white/5 rounded-none text-white focus-visible:ring-primary focus-visible:ring-1" 
                                     />
                                  </div>
                                  <div className="space-y-4">
                                     <label className="text-[10px] uppercase tracking-[0.4em] text-white/20">{isRTL ? "رقم الاتصال" : "Verification Line"}</label>
                                     <Input 
                                       value={formData.phone} 
                                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                       disabled={!editMode}
                                       className="h-16 bg-surface-low border-white/5 rounded-none text-white transition-all" 
                                     />
                                  </div>
                                  {!editMode ? (
                                     <button onClick={() => setEditMode(true)} className="px-12 py-5 border border-primary text-primary text-[10px] uppercase tracking-[0.4em] font-black hover:bg-primary hover:text-black transition-all">
                                        Edit Credentials
                                     </button>
                                  ) : (
                                     <div className="flex gap-4">
                                        <button onClick={handleSave} disabled={saving} className="px-12 py-5 bg-primary text-black text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white transition-all flex items-center gap-3">
                                           {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                                           Record Authority
                                        </button>
                                        <button onClick={() => setEditMode(false)} className="px-12 py-5 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.4em] font-black hover:text-white transition-all">
                                           Cancel
                                        </button>
                                     </div>
                                  )}
                               </div>
                               <div className="p-10 bg-surface-low border border-white/5 space-y-6">
                                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Verified Email</p>
                                  <div className="flex items-center gap-4 text-white font-bold tracking-widest py-4 border-b border-white/5">
                                     <Mail className="h-4 w-4 text-primary" />
                                     {user?.email}
                                  </div>
                                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/10 italic">This address is used for all high-level institutional communications.</p>
                               </div>
                            </div>
                         </div>
                      )}

                      {defaultTab === "orders" && (
                         <div className="space-y-12">
                            <h2 className="text-4xl font-black uppercase tracking-tighter border-b border-white/5 pb-8">{isRTL ? "سجل الاقتناء" : "Acquisition Ledger"}</h2>
                            <UserOrdersSection user={user} isRTL={isRTL} />
                         </div>
                      )}

                      {defaultTab === "notifications" && (
                         <div className="space-y-12">
                            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                               <h2 className="text-4xl font-black uppercase tracking-tighter">{isRTL ? "صندوق Dispatch" : "Dispatch Terminal"}</h2>
                               {unreadCount > 0 && (
                                  <button onClick={() => markAllAsReadMutation.mutate()} className="text-[10px] uppercase tracking-[0.4em] text-primary font-black hover:text-white transition-colors">Silence All Alerts</button>
                               )}
                            </div>
                            <div className="space-y-4">
                               {notifications.length === 0 ? (
                                  <div className="py-32 text-center border border-white/5 bg-surface-low">
                                     <Bell className="h-16 w-16 text-white/5 mx-auto mb-8" />
                                     <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">No transmissions recorded</p>
                                  </div>
                               ) : (
                                  notifications.map((n) => (
                                     <div key={n.id} className={`p-8 border-l-2 transition-all ${n.is_read ? 'border-white/5 opacity-40 grayscale' : 'border-primary bg-surface-low shadow-lg'}`}>
                                        <div className="flex justify-between items-start gap-8 mb-4">
                                           <h4 className="text-lg font-black text-white uppercase tracking-tight">{isRTL ? n.title_ar : n.title}</h4>
                                           <span className="text-[9px] uppercase tracking-widest text-white/20 whitespace-nowrap">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: isRTL ? ar : undefined })}</span>
                                        </div>
                                        <p className="text-sm text-white/60 leading-relaxed mb-6">{isRTL ? n.message_ar : n.message}</p>
                                        {!n.is_read && (
                                           <button onClick={() => markAsReadMutation.mutate(n.id)} className="text-[9px] uppercase tracking-[0.4em] text-primary font-black">Archive Alert</button>
                                        )}
                                     </div>
                                  ))
                               )}
                            </div>
                         </div>
                      )}

                      {defaultTab === "rewards" && (
                         <div className="space-y-12">
                             <h2 className="text-4xl font-black uppercase tracking-tighter border-b border-white/5 pb-8">{isRTL ? "مركز القمة" : "Apex Privilege"}</h2>
                             <div className="grid md:grid-cols-2 gap-12">
                                <section className="space-y-8">
                                   <div className="p-12 bg-surface-low border border-white/5 text-center space-y-4">
                                      <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Current Influence</p>
                                      <p className="text-6xl font-black text-white tracking-tighter">{calculatePoints()} PTS</p>
                                      <p className="text-[9px] uppercase tracking-[0.3em] text-primary italic">Institutional Credits</p>
                                   </div>
                                   <ReferralCard />
                                </section>
                                <section className="space-y-4">
                                   <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 mb-8">Available Redemptions</p>
                                   {[
                                     { points: 500, reward: isRTL ? "خصم 5% على أي سيارة" : "5% off any car", icon: Gift },
                                     { points: 1000, reward: isRTL ? "فحص مجاني للسيارة" : "Free car inspection", icon: Settings },
                                     { points: 2500, reward: isRTL ? "تأمين مجاني لمدة شهر" : "1 month free insurance", icon: Shield },
                                   ].map((item, index) => (
                                     <div key={index} className="p-8 border border-white/5 bg-surface-low flex items-center justify-between group">
                                        <div className="space-y-2">
                                            <h5 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-primary transition-colors">{item.reward}</h5>
                                            <p className="text-[9px] uppercase tracking-widest text-white/30">{item.points} CREDITS</p>
                                        </div>
                                        <button disabled={calculatePoints() < item.points} className="text-[9px] uppercase tracking-[0.4em] font-black disabled:opacity-20 text-primary">Engage</button>
                                     </div>
                                   ))}
                                </section>
                             </div>
                         </div>
                      )}

                      {defaultTab === "addresses" && (
                         <div className="space-y-12">
                             <div className="flex items-end justify-between border-b border-white/5 pb-8">
                               <h2 className="text-4xl font-black uppercase tracking-tighter">{isRTL ? "محطات التوصيل" : "Station Network"}</h2>
                               <button 
                                 onClick={() => { setEditingAddress(null); setAddressForm({ label: "home", city: "", district: "", street: "", building_number: "", postal_code: "", is_default: false }); setShowAddressForm(true); }}
                                 className="text-[10px] uppercase tracking-[0.4em] text-primary font-black hover:text-white transition-colors"
                               >
                                 Assign New Station
                               </button>
                             </div>
                             
                             {showAddressForm ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 bg-surface-low border border-white/5 space-y-10 max-w-2xl">
                                   <div className="grid grid-cols-2 gap-8">
                                      <div className="space-y-4">
                                         <label className="text-[10px] uppercase tracking-[0.4em] text-white/20">Station Label</label>
                                         <div className="flex gap-4">
                                            {["home", "work", "other"].map(l => (
                                               <button key={l} onClick={() => setAddressForm({...addressForm, label: l})} className={`p-4 border text-[9px] uppercase tracking-widest font-black flex-1 transition-all ${addressForm.label === l ? 'bg-primary text-black border-primary' : 'border-white/10 text-white/40 hover:text-white'}`}>
                                                  {l}
                                               </button>
                                            ))}
                                         </div>
                                      </div>
                                      <div className="space-y-4">
                                         <label className="text-[10px] uppercase tracking-[0.4em] text-white/20">Metropolitan</label>
                                         <Input value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="h-14 bg-black/40 border-white/10" />
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-8">
                                      <div className="space-y-4">
                                         <label className="text-[10px] uppercase tracking-[0.4em] text-white/20">Sector / District</label>
                                         <Input value={addressForm.district} onChange={e => setAddressForm({...addressForm, district: e.target.value})} className="h-14 bg-black/40 border-white/10" />
                                      </div>
                                      <div className="space-y-4">
                                         <label className="text-[10px] uppercase tracking-[0.4em] text-white/20">Thoroughfare</label>
                                         <Input value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="h-14 bg-black/40 border-white/10" />
                                      </div>
                                   </div>
                                   <div className="flex gap-4 pt-6">
                                      <button onClick={() => addAddressMutation.mutate(addressForm)} className="px-12 py-5 bg-primary text-black text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white transition-all">Record Station</button>
                                      <button onClick={() => setShowAddressForm(false)} className="px-12 py-5 border border-white/10 text-white/40 text-[10px] uppercase tracking-[0.4em] font-black hover:text-white transition-all">Cancel</button>
                                   </div>
                                </motion.div>
                             ) : (
                                <div className="grid md:grid-cols-2 gap-8">
                                   {addresses.map(addr => (
                                      <div key={addr.id} className={`p-10 border transition-all duration-700 ${addr.is_default ? 'bg-surface-low border-primary shadow-[0_0_30px_rgba(var(--primary),0.05)]' : 'border-white/5 bg-surface-low hover:border-white/20'}`}>
                                         <div className="flex justify-between items-start mb-10">
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-black text-white uppercase tracking-tight">{addr.label} Station</h4>
                                                {addr.is_default && <span className="text-[8px] uppercase tracking-[0.3em] text-primary font-black px-2 py-1 border border-primary/20">Primary Hub</span>}
                                            </div>
                                            <div className="flex gap-4">
                                               <button onClick={() => deleteAddressMutation.mutate(addr.id)} className="text-white/20 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                         </div>
                                         <div className="space-y-1 text-[11px] uppercase tracking-[0.3em] text-white/40">
                                            <p className="text-white font-bold">{addr.street}</p>
                                            <p>{addr.district}, {addr.city}</p>
                                            <p>Sector {addr.postal_code || '---'}</p>
                                         </div>
                                         {!addr.is_default && (
                                            <button onClick={() => setDefaultAddressMutation.mutate(addr.id)} className="mt-10 text-[9px] uppercase tracking-[0.4em] text-primary font-black hover:text-white transition-colors">Establish as Primary Hub</button>
                                         )}
                                      </div>
                                   ))}
                                </div>
                             )}
                         </div>
                      )}

                      {defaultTab === "security" && (
                         <div className="space-y-12">
                             <h2 className="text-4xl font-black uppercase tracking-tighter border-b border-white/5 pb-8">{isRTL ? "بروتوكولات الأمان" : "Security Protocols"}</h2>
                             <div className="grid md:grid-cols-2 gap-12">
                                <div className="p-10 bg-surface-low border border-white/5 space-y-8">
                                   <div className="space-y-2">
                                      <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/20">Credential Rotation</h4>
                                      <p className="text-sm text-white/40 italic">Update your primary entry signature.</p>
                                   </div>
                                   <div className="space-y-4">
                                      <Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} placeholder="NEW SIGNATURE" className="h-16 bg-black/40 border-white/10 rounded-none text-white tracking-[0.4em] text-xs" />
                                      <Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} placeholder="CONFIRM SIGNATURE" className="h-16 bg-black/40 border-white/10 rounded-none text-white tracking-[0.4em] text-xs" />
                                   </div>
                                   <button onClick={handlePasswordChange} disabled={changingPassword} className="w-full py-5 bg-primary text-black text-[10px] uppercase tracking-[0.4em] font-black hover:bg-white transition-all">Execute Encryption</button>
                                </div>

                                <div className="space-y-8">
                                   <div className="p-10 bg-surface-low border border-white/5 flex items-center justify-between">
                                      <div className="space-y-2">
                                         <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Verification Status</p>
                                         <p className="text-sm font-bold text-white tracking-widest">{user?.email}</p>
                                      </div>
                                      <CheckCircle2 className="h-6 w-6 text-primary" />
                                   </div>
                                   <div className="p-10 bg-surface-low border border-red-500/10 space-y-6">
                                      <p className="text-[10px] uppercase tracking-[0.4em] text-red-500/40">Critical Action</p>
                                      <button onClick={handleLogout} className="w-full py-5 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-red-500 hover:text-white transition-all">Sign out from All Terminals</button>
                                   </div>
                                </div>
                             </div>
                         </div>
                      )}
                   </motion.div>
                </AnimatePresence>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
