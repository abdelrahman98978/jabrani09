import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gift, Copy, Share2, Users, DollarSign, Check, MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ReferralCard = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile-referral", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code, total_referrals, referral_earnings")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");
      const code = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { error } = await supabase
        .from("profiles")
        .update({ referral_code: code })
        .eq("user_id", userId);
      if (error) throw error;
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-referral"] });
      toast.success(isRTL ? "تم إنشاء رمز الإحالة" : "Referral code generated");
    },
  });

  const referralLink = profile?.referral_code 
    ? `${window.location.origin}/auth?ref=${profile.referral_code}`
    : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(isRTL ? "تم نسخ الرابط" : "Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: isRTL ? "انضم إلى معرض السيارات" : "Join Car Showroom",
          text: isRTL 
            ? "سجل باستخدام رابط الإحالة الخاص بي واحصل على خصم خاص!"
            : "Sign up using my referral link and get a special discount!",
          url: referralLink,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareViaWhatsApp = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      isRTL 
        ? `انضم إلى معرض السيارات واحصل على خصم خاص! استخدم رابط الإحالة الخاص بي: ${referralLink}`
        : `Join our Car Showroom and get a special discount! Use my referral link: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      isRTL 
        ? "انضم إلى معرض السيارات واحصل على خصم خاص!"
        : "Join our Car Showroom and get a special discount!"
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  if (!userId) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          {isRTL ? "برنامج الإحالة" : "Referral Program"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{profile?.total_referrals || 0}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "إحالات ناجحة" : "Successful Referrals"}
            </p>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{profile?.referral_earnings || 0}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? "ر.س أرباح" : "SAR Earned"}
            </p>
          </div>
        </div>

        {/* Referral Code/Link */}
        {profile?.referral_code ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-base font-mono">
                {profile.referral_code}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-xs bg-background/50"
              />
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex gap-2 pt-2">
              <p className="text-xs text-muted-foreground self-center">
                {isRTL ? "شارك عبر:" : "Share via:"}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/30 text-[#25D366]"
                      onClick={shareViaWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">{isRTL ? "واتساب" : "WhatsApp"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRTL ? "مشاركة عبر واتساب" : "Share via WhatsApp"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 bg-foreground/5 hover:bg-foreground/10 border-foreground/20"
                      onClick={shareViaTwitter}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="hidden sm:inline">X</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRTL ? "مشاركة عبر X" : "Share via X"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRTL ? "نسخ الرابط" : "Copy link"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => generateCodeMutation.mutate()}
            disabled={generateCodeMutation.isPending}
          >
            <Gift className="h-4 w-4 me-2" />
            {isRTL ? "إنشاء رمز الإحالة" : "Generate Referral Code"}
          </Button>
        )}

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center">
          {isRTL 
            ? "شارك رابط الإحالة مع أصدقائك واحصل على مكافآت عند شرائهم"
            : "Share your referral link with friends and earn rewards when they purchase"}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralCard;
