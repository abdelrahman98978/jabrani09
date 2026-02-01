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
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

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

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, cars(name_ar, main_image, price, model, year), customers(name, phone, email, city)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user orders", error);
        toast({
          variant: "destructive",
          title: isRTL ? "خطأ في تحميل الطلبات" : "Error loading orders",
          description: error.message,
        });
        return [];
      }

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

  const getDeliveryLabel = (method: string | null) => {
    if (method === "pickup") return isRTL ? "استلام من المعرض" : "Pickup from showroom";
    if (method === "delivery") return isRTL ? "توصيل عبر سحاب" : "Delivery via Sahab";
    return "-";
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {isRTL ? "سجّل الدخول لعرض طلباتك" : "Sign in to view your orders"}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="relative inline-block mb-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShoppingCart className="h-12 w-12 text-primary/50" />
          </div>
          <Sparkles className="absolute top-0 right-0 h-6 w-6 text-primary/30 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-3">
          {isRTL ? "لا توجد طلبات بعد" : "No Orders Yet"}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {isRTL
            ? "ابدأ رحلتك معنا واستكشف مجموعتنا المميزة من السيارات"
            : "Start your journey with us and explore our premium car collection"}
        </p>
        <Button onClick={() => window.location.assign("/cars")} size="lg" className="gap-2 rounded-xl">
          <Car className="h-5 w-5" />
          {isRTL ? "تصفح السيارات" : "Browse Cars"}
        </Button>
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
    <div className="space-y-4">
      {orders.map((order: any) => {
        const activeIndex = Math.max(
          0,
          steps.findIndex((s) => s.id === order.status)
        );

        const progress = ((activeIndex + 1) / steps.length) * 100;

        return (
          <Card key={order.id} className="border-border/60 bg-card/80 mb-4">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? "رقم الطلب" : "Order"} #{order.order_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString(isRTL ? "ar-SA" : "en-US")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    {getStatusLabel(order.status)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {isRTL ? "طريقة الدفع" : "Payment"}: {order.payment_method === "bank_transfer" ? (isRTL ? "تحويل بنكي" : "Bank Transfer") : (isRTL ? "نقدًا" : "Cash")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {isRTL ? "الاستلام" : "Delivery"}: {getDeliveryLabel(order.delivery_method)}
                  </Badge>
                </div>
              </div>

              {/* Car summary */}
              {order.cars && (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/40">
                  <img
                    src={order.cars.main_image || "/placeholder.svg"}
                    alt={order.cars.name_ar}
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{order.cars.name_ar}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.cars.model} - {order.cars.year}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {Number(order.total_amount).toLocaleString()} {isRTL ? "ر.س" : "SAR"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <a
                      href={`/orders/${order.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {isRTL ? "عرض التفاصيل" : "View Details"}
                    </a>
                    {/* Invoice Download Button */}
                    {order.payment_status === "paid" && (
                      <InvoicePDF
                        order={{
                          ...order,
                          customers: order.customers,
                          cars: order.cars,
                        }}
                      />
                    )}
                    {order.payment_status !== "paid" && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {isRTL ? "الفاتورة متاحة بعد السداد" : "Invoice available after payment"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {isRTL ? "مراحل الطلب" : "Order stages"}
                </p>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  {steps.map((step, idx) => (
                    <span
                      key={step.id}
                      className={idx <= activeIndex ? "text-primary font-semibold" : ""}
                    >
                      {isRTL ? step.labelAr : step.labelEn}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delivery notes */}
              {order.delivery_method === "delivery" && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold">
                    {isRTL ? "عنوان التوصيل:" : "Delivery address:"}
                  </span>{" "}
                  {order.delivery_city && `${order.delivery_city} - `}
                  {order.delivery_address}
                </div>
              )}
            </CardContent>
          </Card>
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
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "home",
    city: "",
    district: "",
    street: "",
    building_number: "",
    postal_code: "",
    is_default: false,
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Get default tab from URL
  const defaultTab = searchParams.get("tab") || "profile";

  // Fetch orders count
  const { data: ordersCount = 0 } = useQuery({
    queryKey: ["orders-count", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count || 0;
    },
  });

  // Fetch wishlist cars
  const { data: wishlistCars = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ["wishlist-cars-profile", wishlistItems],
    enabled: wishlistItems.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .in("id", wishlistItems);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
  });

  // Fetch addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
  });

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Mark notification as read
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

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديد جميع الإشعارات كمقروءة" : "All notifications marked as read",
      });
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (address: typeof addressForm) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setShowAddressForm(false);
      resetAddressForm();
      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم إضافة العنوان بنجاح" : "Address added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, ...address }: Address) => {
      const { error } = await supabase
        .from("addresses")
        .update(address)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingAddress(null);
      resetAddressForm();
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث العنوان بنجاح" : "Address updated successfully",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف العنوان بنجاح" : "Address deleted successfully",
      });
    },
  });

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) return;
      // First, unset all defaults
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
      // Then set the new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديد العنوان الافتراضي" : "Default address updated",
      });
    },
  });

  const resetAddressForm = () => {
    setAddressForm({
      label: "home",
      city: "",
      district: "",
      street: "",
      building_number: "",
      postal_code: "",
      is_default: false,
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("car-images")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: urlData.publicUrl } : null);
      toast({
        title: isRTL ? "تم رفع الصورة" : "Avatar uploaded",
        description: isRTL ? "تم تحديث صورتك الشخصية بنجاح" : "Your avatar has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // MFA State
  const [mfaData, setMfaData] = useState<{ id: string; type: string; secret: string; qr_code: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false);
  const [verifyingMfa, setVerifyingMfa] = useState(false);

  const handleEnrollMFA = async () => {
    try {
      setIsEnrollingMfa(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;
      setMfaData(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message
      });
    } finally {
      setIsEnrollingMfa(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaData) return;
    setVerifyingMfa(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaData.id,
        code: mfaCode,
      });
      if (error) throw error;
      toast({
        title: isRTL ? "تم تفعيل المصادقة الثنائية" : "2FA Enabled",
        description: isRTL ? "تم تأمين حسابك بنجاح" : "Your account is now secured",
      });
      setMfaData(null);
      setMfaCode("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "رمز غير صحيح" : "Invalid Code",
        description: error.message
      });
    } finally {
      setVerifyingMfa(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordForm({ newPassword: "", confirmPassword: "" });
      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
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
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...formData } : null);
      setEditMode(false);
      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMembershipLevel = () => {
    if (!profile?.created_at) return { level: "bronze", name: isRTL ? "برونزي" : "Bronze" };
    const months = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months >= 12) return { level: "gold", name: isRTL ? "ذهبي" : "Gold" };
    if (months >= 6) return { level: "silver", name: isRTL ? "فضي" : "Silver" };
    return { level: "bronze", name: isRTL ? "برونزي" : "Bronze" };
  };

  const membership = getMembershipLevel();

  // Calculate real points
  const calculatePoints = () => {
    const signupBonus = 100;
    const referralPoints = (profile?.referral_earnings || 0);
    const orderPoints = ordersCount * 50;
    return signupBonus + referralPoints + orderPoints;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order": return <Package className="h-5 w-5 text-blue-500" />;
      case "promotion": return <Gift className="h-5 w-5 text-purple-500" />;
      case "system": return <Bell className="h-5 w-5 text-amber-500" />;
      case "message": return <MessageSquare className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label) {
      case "home": return <Home className="h-5 w-5" />;
      case "work": return <Building className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const getAddressLabel = (label: string) => {
    switch (label) {
      case "home": return isRTL ? "المنزل" : "Home";
      case "work": return isRTL ? "العمل" : "Work";
      default: return isRTL ? "أخرى" : "Other";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary/20 to-primary/40 animate-pulse mx-auto mb-4" />
            <Loader2 className="h-8 w-8 animate-spin text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground animate-pulse">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Premium Hero Header */}
        <div className="relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          <div className="absolute inset-0 pattern-overlay opacity-30" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/15 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="container mx-auto px-4 py-12 relative z-10">
            {/* Profile Header Card */}
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl overflow-hidden">
              <div className="relative">
                {/* Cover gradient */}
                <div className="h-32 md:h-44 bg-gradient-to-br from-primary via-primary/80 to-primary/60 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-8 w-20 h-20 border-4 border-white/30 rounded-full" />
                    <div className="absolute bottom-4 left-12 w-32 h-32 border-4 border-white/20 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 border-4 border-white/10 rounded-full" />
                  </div>
                  <Sparkles className="absolute top-4 left-4 h-6 w-6 text-white/50 animate-pulse" />
                  <Sparkles className="absolute bottom-4 right-8 h-4 w-4 text-white/40 animate-pulse delay-300" />
                </div>

                {/* Profile Info */}
                <div className="relative px-6 pb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 md:-mt-20">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                      <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl relative z-10">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="text-3xl md:text-4xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-20 border-2 border-background disabled:opacity-50"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                      </button>

                      {/* Membership Badge */}
                      <div className={`absolute -top-2 -right-2 z-20 ${membership.level === 'gold' ? 'bg-yellow-500' :
                        membership.level === 'silver' ? 'bg-gray-400' : 'bg-amber-700'
                        } rounded-full p-2 shadow-lg`}>
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-start pb-4">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                        <h1 className="text-2xl md:text-3xl font-black text-foreground">
                          {profile?.full_name || (isRTL ? "مستخدم جديد" : "New User")}
                        </h1>
                        <Badge className={`gap-1 ${membership.level === 'gold' ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' :
                          membership.level === 'silver' ? 'bg-gray-500/20 text-gray-600 border-gray-500/30' :
                            'bg-amber-700/20 text-amber-700 border-amber-700/30'
                          }`}>
                          <Trophy className="h-3 w-3" />
                          {membership.name}
                        </Badge>
                        {profile?.role && (
                          <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                            <Shield className="h-3 w-3" />
                            {profile.role === "admin"
                              ? (isRTL ? "مدير" : "Admin")
                              : profile.role === "moderator"
                                ? (isRTL ? "مشرف" : "Moderator")
                                : (isRTL ? "عضو" : "Member")
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row gap-3 text-muted-foreground">
                        <p className="flex items-center gap-2 justify-center md:justify-start">
                          <Mail className="h-4 w-4 text-primary" />
                          {user?.email}
                        </p>
                        {profile?.phone && (
                          <p className="flex items-center gap-2 justify-center md:justify-start">
                            <Phone className="h-4 w-4 text-primary" />
                            <span dir="ltr">{profile.phone}</span>
                          </p>
                        )}
                        {profile?.created_at && (
                          <p className="flex items-center gap-2 justify-center md:justify-start">
                            <Calendar className="h-4 w-4 text-primary" />
                            {isRTL ? "عضو منذ" : "Member since"} {new Date(profile.created_at).toLocaleDateString(
                              language === "ar" ? "ar-SA" : "en-US",
                              { month: "long", year: "numeric" }
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" size="icon" className="rounded-full relative" onClick={() => navigate("/profile?tab=notifications")}>
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-full" onClick={() => navigate("/profile?tab=security")}>
                        <Settings className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="gap-2 rounded-full"
                      >
                        <LogOut className="h-4 w-4" />
                        {t.auth.logout}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="container mx-auto px-4 -mt-6 relative z-20 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShoppingCart, label: isRTL ? "طلباتي" : "Orders", value: String(ordersCount), color: "from-blue-500 to-blue-600", link: "/profile?tab=orders" },
              { icon: Heart, label: isRTL ? "المفضلة" : "Favorites", value: String(wishlistItems.length), color: "from-rose-500 to-rose-600", link: "/wishlist" },
              { icon: Bell, label: isRTL ? "الإشعارات" : "Notifications", value: String(unreadCount), color: "from-amber-500 to-amber-600", link: "/profile?tab=notifications" },
              { icon: Star, label: isRTL ? "النقاط" : "Points", value: String(calculatePoints()), color: "from-yellow-500 to-amber-500", link: "/profile?tab=rewards" },
            ].map((stat, index) => (
              <Link to={stat.link} key={index}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <CardContent className="p-4 relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4">
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="w-full md:w-auto bg-card/50 backdrop-blur-sm p-1 rounded-2xl flex-wrap h-auto gap-1">
              <TabsTrigger value="profile" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="h-4 w-4" />
                {isRTL ? "الملف الشخصي" : "Profile"}
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
                {isRTL ? "طلباتي" : "My Orders"}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="h-4 w-4" />
                {isRTL ? "المفضلة" : "Favorites"}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
                <Bell className="h-4 w-4" />
                {isRTL ? "الإشعارات" : "Notifications"}
                {unreadCount > 0 && (
                  <Badge className="h-5 min-w-5 p-0 flex items-center justify-center text-[10px] bg-destructive absolute -top-1 -right-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rewards" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Gift className="h-4 w-4" />
                {isRTL ? "المكافآت" : "Rewards"}
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MapPin className="h-4 w-4" />
                {isRTL ? "العناوين" : "Addresses"}
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Shield className="h-4 w-4" />
                {isRTL ? "الأمان" : "Security"}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Edit Profile Card */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Edit3 className="h-5 w-5 text-primary" />
                          </div>
                          {isRTL ? "تعديل الملف الشخصي" : "Edit Profile"}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {isRTL
                            ? "قم بتحديث معلوماتك الشخصية"
                            : "Update your personal information"
                          }
                        </CardDescription>
                      </div>
                      {!editMode && (
                        <Button variant="ghost" size="icon" onClick={() => setEditMode(true)} className="rounded-full hover:bg-primary/10">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {t.auth.fullName}
                      </label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!editMode}
                        placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                        className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        {t.auth.phone}
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editMode}
                        placeholder="+966 5XX XXX XXXX"
                        dir="ltr"
                        className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        {t.auth.email}
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        dir="ltr"
                        className="h-12 rounded-xl bg-muted/50 border-2"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        {isRTL ? "البريد الإلكتروني تم التحقق منه" : "Email verified"}
                      </p>
                    </div>

                    {editMode && (
                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl flex-1">
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {isRTL ? "حفظ التغييرات" : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditMode(false)} className="rounded-xl">
                          {isRTL ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions Card */}
                <div className="space-y-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Settings className="h-5 w-5 text-primary" />
                        </div>
                        {isRTL ? "إجراءات سريعة" : "Quick Actions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: Car, label: isRTL ? "تصفح السيارات" : "Browse Cars", onClick: () => navigate("/cars"), color: "text-blue-500", bg: "bg-blue-500/10" },
                          { icon: Heart, label: isRTL ? "المفضلة" : "Favorites", onClick: () => navigate("/wishlist"), color: "text-rose-500", bg: "bg-rose-500/10", badge: wishlistItems.length > 0 ? wishlistItems.length : undefined },
                          { icon: ShoppingCart, label: isRTL ? "طلباتي" : "My Orders", onClick: () => navigate("/profile?tab=orders"), color: "text-green-500", bg: "bg-green-500/10", badge: ordersCount > 0 ? ordersCount : undefined },
                          { icon: Bell, label: isRTL ? "الإشعارات" : "Notifications", onClick: () => navigate("/profile?tab=notifications"), color: "text-amber-500", bg: "bg-amber-500/10", badge: unreadCount > 0 ? unreadCount : undefined },
                          { icon: Star, label: isRTL ? "المكافآت" : "Rewards", onClick: () => navigate("/profile?tab=rewards"), color: "text-yellow-500", bg: "bg-yellow-500/10" },
                          { icon: Gift, label: isRTL ? "الإحالات" : "Referrals", onClick: () => navigate("/profile?tab=rewards"), color: "text-purple-500", bg: "bg-purple-500/10" },
                          { icon: MapPin, label: isRTL ? "العناوين" : "Addresses", onClick: () => navigate("/profile?tab=addresses"), color: "text-teal-500", bg: "bg-teal-500/10" },
                          { icon: Shield, label: isRTL ? "الأمان" : "Security", onClick: () => navigate("/profile?tab=security"), color: "text-indigo-500", bg: "bg-indigo-500/10" },
                        ].map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="h-20 flex-col gap-2 rounded-xl hover:bg-primary/5 hover:border-primary/30 transition-all relative"
                            onClick={action.onClick}
                          >
                            <div className={`h-10 w-10 rounded-lg ${action.bg} flex items-center justify-center`}>
                              <action.icon className={`h-5 w-5 ${action.color}`} />
                            </div>
                            <span className="text-xs font-medium">{action.label}</span>
                            {action.badge && (
                              <Badge className="absolute top-2 right-2 h-5 min-w-5 p-0 flex items-center justify-center text-[10px] bg-primary">
                                {action.badge}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Membership Card */}
                  <Card className={`overflow-hidden border-2 ${membership.level === 'gold' ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent' :
                    membership.level === 'silver' ? 'border-gray-500/30 bg-gradient-to-br from-gray-500/5 to-transparent' :
                      'border-amber-700/30 bg-gradient-to-br from-amber-700/5 to-transparent'
                    }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${membership.level === 'gold' ? 'bg-yellow-500' :
                          membership.level === 'silver' ? 'bg-gray-400' : 'bg-amber-700'
                          } shadow-lg`}>
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{isRTL ? "عضوية" : "Membership"} {membership.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? "100 نقطة حتى المستوى التالي" : "100 points to next level"}
                          </p>
                          <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                            <div className={`h-full rounded-full ${membership.level === 'gold' ? 'bg-yellow-500' :
                              membership.level === 'silver' ? 'bg-gray-400' : 'bg-amber-700'
                              }`} style={{ width: '60%' }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="overflow-hidden">
                <CardContent className="pt-6">
                  <UserOrdersSection user={user} isRTL={isRTL} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card className="overflow-hidden">
                {wishlistLoading ? (
                  <CardContent className="py-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </CardContent>
                ) : wishlistItems.length === 0 ? (
                  <CardContent className="py-20 text-center">
                    <div className="relative inline-block mb-6">
                      <div className="h-24 w-24 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
                        <Heart className="h-12 w-12 text-rose-500/50" />
                      </div>
                      <Sparkles className="absolute top-0 right-0 h-6 w-6 text-rose-500/30 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {isRTL ? "قائمة المفضلة فارغة" : "No Favorites Yet"}
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      {isRTL
                        ? "احفظ سياراتك المفضلة هنا لتجدها بسهولة لاحقاً"
                        : "Save your favorite cars here to find them easily later"
                      }
                    </p>
                    <Button onClick={() => navigate("/cars")} variant="outline" size="lg" className="gap-2 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/5">
                      <Heart className="h-5 w-5" />
                      {isRTL ? "اكتشف السيارات" : "Discover Cars"}
                    </Button>
                  </CardContent>
                ) : (
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">
                        {isRTL ? `${wishlistItems.length} سيارة في المفضلة` : `${wishlistItems.length} cars in favorites`}
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => navigate("/wishlist")} className="gap-2">
                        <Eye className="h-4 w-4" />
                        {isRTL ? "عرض الكل" : "View All"}
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistCars.slice(0, 6).map((car: any) => (
                        <div key={car.id} className="relative group">
                          <CarCard car={mapCarToCardData(car)} />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromWishlist(car.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {wishlistItems.length > 6 && (
                      <div className="text-center mt-6">
                        <Button onClick={() => navigate("/wishlist")} className="gap-2">
                          {isRTL ? `عرض ${wishlistItems.length - 6} سيارة أخرى` : `View ${wishlistItems.length - 6} more cars`}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-amber-500" />
                      </div>
                      {isRTL ? "الإشعارات" : "Notifications"}
                      {unreadCount > 0 && (
                        <Badge className="bg-destructive">{unreadCount}</Badge>
                      )}
                    </CardTitle>
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isPending}
                        className="gap-2"
                      >
                        <CheckCheck className="h-4 w-4" />
                        {isRTL ? "تحديد الكل كمقروء" : "Mark all as read"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {notificationsLoading ? (
                    <div className="py-12 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="h-24 w-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                        <Bell className="h-12 w-12 text-amber-500/50" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {isRTL ? "لا توجد إشعارات" : "No Notifications"}
                      </h3>
                      <p className="text-muted-foreground">
                        {isRTL ? "ستظهر إشعاراتك هنا" : "Your notifications will appear here"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-xl border transition-colors cursor-pointer ${notification.is_read
                            ? 'bg-muted/30 border-border/50'
                            : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                            }`}
                          onClick={() => {
                            if (!notification.is_read) {
                              markAsReadMutation.mutate(notification.id);
                            }
                            if (notification.link) {
                              navigate(notification.link);
                            }
                          }}
                        >
                          <div className="flex gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${notification.is_read ? 'bg-muted' : 'bg-primary/10'
                              }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-semibold ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {isRTL && notification.title_ar ? notification.title_ar : notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {isRTL && notification.message_ar ? notification.message_ar : notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-2">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: isRTL ? ar : undefined,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-yellow-500/10 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      {isRTL ? "نقاطي" : "My Points"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center py-6">
                      <p className="text-5xl font-black text-foreground mb-2">{calculatePoints()}</p>
                      <p className="text-muted-foreground">{isRTL ? "نقطة متاحة" : "Points Available"}</p>
                    </div>
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? "نقاط التسجيل" : "Sign up bonus"}</span>
                        <span className="font-semibold text-green-500">+100</span>
                      </div>
                      {ordersCount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{isRTL ? "نقاط الطلبات" : "Order points"}</span>
                          <span className="font-semibold text-green-500">+{ordersCount * 50}</span>
                        </div>
                      )}
                      {(profile?.referral_earnings || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{isRTL ? "أرباح الإحالات" : "Referral earnings"}</span>
                          <span className="font-semibold text-green-500">+{profile?.referral_earnings}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Card */}
                <ReferralCard />

                <Card className="overflow-hidden md:col-span-2">
                  <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      {isRTL ? "المكافآت المتاحة" : "Available Rewards"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { points: 500, reward: isRTL ? "خصم 5% على أي سيارة" : "5% off any car", icon: "🎁" },
                        { points: 1000, reward: isRTL ? "فحص مجاني للسيارة" : "Free car inspection", icon: "🔧" },
                        { points: 2500, reward: isRTL ? "تأمين مجاني لمدة شهر" : "1 month free insurance", icon: "🛡️" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center text-2xl">
                              {item.icon}
                            </div>
                            <div>
                              <span className="font-medium block">{item.reward}</span>
                              <Badge variant="outline" className="gap-1 mt-1">
                                {item.points} {isRTL ? "نقطة" : "pts"}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={calculatePoints() >= item.points ? "default" : "outline"}
                            disabled={calculatePoints() < item.points}
                          >
                            {isRTL ? "استبدال" : "Redeem"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-teal-500/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-teal-500" />
                      </div>
                      {isRTL ? "العناوين المحفوظة" : "Saved Addresses"}
                    </CardTitle>
                    <Button
                      onClick={() => {
                        resetAddressForm();
                        setShowAddressForm(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {isRTL ? "إضافة عنوان" : "Add Address"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {addressesLoading ? (
                    <div className="py-12 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : showAddressForm || editingAddress ? (
                    <div className="space-y-4 max-w-lg">
                      <h3 className="font-semibold">
                        {editingAddress
                          ? (isRTL ? "تعديل العنوان" : "Edit Address")
                          : (isRTL ? "إضافة عنوان جديد" : "Add New Address")
                        }
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {["home", "work", "other"].map((label) => (
                          <Button
                            key={label}
                            type="button"
                            variant={addressForm.label === label ? "default" : "outline"}
                            onClick={() => setAddressForm({ ...addressForm, label })}
                            className="gap-2"
                          >
                            {getAddressIcon(label)}
                            {getAddressLabel(label)}
                          </Button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{isRTL ? "المدينة" : "City"}</label>
                          <Input
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder={isRTL ? "الرياض" : "Riyadh"}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{isRTL ? "الحي" : "District"}</label>
                          <Input
                            value={addressForm.district}
                            onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                            placeholder={isRTL ? "العليا" : "Al Olaya"}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{isRTL ? "الشارع" : "Street"}</label>
                        <Input
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder={isRTL ? "شارع العليا" : "Al Olaya Street"}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{isRTL ? "رقم المبنى" : "Building No."}</label>
                          <Input
                            value={addressForm.building_number}
                            onChange={(e) => setAddressForm({ ...addressForm, building_number: e.target.value })}
                            placeholder="1234"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">{isRTL ? "الرمز البريدي" : "Postal Code"}</label>
                          <Input
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                            placeholder="12345"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => {
                            if (editingAddress) {
                              updateAddressMutation.mutate({
                                ...editingAddress,
                                ...addressForm,
                              });
                            } else {
                              addAddressMutation.mutate(addressForm);
                            }
                          }}
                          disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                          className="gap-2"
                        >
                          {(addAddressMutation.isPending || updateAddressMutation.isPending) && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          <Save className="h-4 w-4" />
                          {isRTL ? "حفظ" : "Save"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            resetAddressForm();
                          }}
                        >
                          {isRTL ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="h-24 w-24 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6">
                        <MapPin className="h-12 w-12 text-teal-500/50" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {isRTL ? "لا توجد عناوين محفوظة" : "No Saved Addresses"}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {isRTL ? "أضف عنوانك لتسهيل عملية التوصيل" : "Add your address to make delivery easier"}
                      </p>
                      <Button onClick={() => setShowAddressForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {isRTL ? "إضافة عنوان" : "Add Address"}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-4 rounded-xl border-2 transition-colors ${address.is_default
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${address.is_default ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                {getAddressIcon(address.label)}
                              </div>
                              <div>
                                <h4 className="font-semibold">{getAddressLabel(address.label)}</h4>
                                {address.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    {isRTL ? "افتراضي" : "Default"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingAddress(address);
                                  setAddressForm({
                                    label: address.label,
                                    city: address.city || "",
                                    district: address.district || "",
                                    street: address.street || "",
                                    building_number: address.building_number || "",
                                    postal_code: address.postal_code || "",
                                    is_default: address.is_default,
                                  });
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteAddressMutation.mutate(address.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {address.street && <p>{address.street}</p>}
                            {(address.district || address.city) && (
                              <p>{[address.district, address.city].filter(Boolean).join(", ")}</p>
                            )}
                            {(address.building_number || address.postal_code) && (
                              <p>
                                {address.building_number && `${isRTL ? "مبنى" : "Bldg"} ${address.building_number}`}
                                {address.building_number && address.postal_code && " - "}
                                {address.postal_code && `${isRTL ? "ر.ب" : "P.O"} ${address.postal_code}`}
                              </p>
                            )}
                          </div>
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full"
                              onClick={() => setDefaultAddressMutation.mutate(address.id)}
                            >
                              {isRTL ? "تعيين كافتراضي" : "Set as Default"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Key className="h-5 w-5 text-indigo-500" />
                      </div>
                      {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                    </CardTitle>
                    <CardDescription>
                      {isRTL
                        ? "قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك"
                        : "Update your password to keep your account secure"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        {isRTL ? "كلمة المرور الجديدة" : "New Password"}
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
                      </label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handlePasswordChange}
                      disabled={changingPassword || !passwordForm.newPassword}
                      className="w-full gap-2"
                    >
                      {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Key className="h-4 w-4" />
                      {isRTL ? "تحديث كلمة المرور" : "Update Password"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-green-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-500" />
                      </div>
                      {isRTL ? "أمان الحساب" : "Account Security"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{isRTL ? "البريد الإلكتروني" : "Email"}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        {isRTL ? "موثق" : "Verified"}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">{isRTL ? "المصادقة الثنائية" : "Two-Factor Auth"}</p>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? "حماية إضافية لحسابك" : "Extra protection for your account"}
                            </p>
                          </div>
                        </div>
                        {!mfaData && (
                          <Button variant="outline" size="sm" onClick={handleEnrollMFA} disabled={isEnrollingMfa}>
                            {isEnrollingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "تفعيل" : "Enable")}
                          </Button>
                        )}
                      </div>

                      {mfaData && (
                        <div className="space-y-4 p-4 border rounded-xl bg-background animate-in fade-in zoom-in-95">
                          <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-center text-muted-foreground">
                              {isRTL
                                ? "امسح الرمز المربع باستخدام تطبيق المصادقة (Google Authenticator)"
                                : "Scan the QR code with your authenticator app (e.g. Google Authenticator)"}
                            </p>
                            <img src={mfaData.qr_code} alt="QR Code" className="w-48 h-48 rounded-lg border shadow-sm" />
                            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded selectable">
                              {mfaData.secret}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{isRTL ? "أدخل رمز التحقق" : "Enter Verification Code"}</label>
                            <div className="flex gap-2">
                              <Input
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                placeholder="123456"
                                className="text-center tracking-widest text-lg"
                                maxLength={6}
                              />
                              <Button onClick={handleVerifyMFA} disabled={verifyingMfa || mfaCode.length < 6}>
                                {verifyingMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRTL ? "تأكيد" : "Verify")}
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setMfaData(null)}
                          >
                            {isRTL ? "إلغاء" : "Cancel"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{isRTL ? "آخر تسجيل دخول" : "Last Login"}</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.last_sign_in_at
                              ? new Date(user.last_sign_in_at).toLocaleString(isRTL ? "ar-SA" : "en-US")
                              : (isRTL ? "غير متاح" : "Not available")
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {isRTL ? "تسجيل الخروج من جميع الأجهزة" : "Sign out from all devices"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
