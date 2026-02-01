import { MessageCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const WhatsAppButton = () => {
  const { data: settings } = useSettings();
  
  const phoneNumber = settings?.whatsapp || settings?.phone?.replace(/\D/g, '') || "966543389314";

  const handleClick = () => {
    const message = encodeURIComponent("مرحباً، أرغب في الاستفسار عن السيارات المتوفرة لديكم");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse-gold"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
};

export default WhatsAppButton;
