import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationSoundToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

const NotificationSoundToggle = ({ 
  variant = "icon", 
  className = "" 
}: NotificationSoundToggleProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { isMuted, volume, toggleMute, setVolume, playNotificationSound } = useNotificationSound();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className={className}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isMuted 
              ? (isRTL ? "تفعيل صوت الإشعارات" : "Unmute notifications")
              : (isRTL ? "كتم صوت الإشعارات" : "Mute notifications")
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${className}`}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span>{isRTL ? "صوت الإشعارات" : "Notification Sound"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64" 
        align={isRTL ? "start" : "end"}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isRTL ? "صوت الإشعارات" : "Notification Sound"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{isRTL ? "مستوى الصوت" : "Volume"}</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
              disabled={isMuted}
              className="w-full"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestSound}
            disabled={isMuted}
            className="w-full"
          >
            {isRTL ? "اختبار الصوت" : "Test Sound"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {isMuted 
              ? (isRTL ? "الصوت مكتوم حالياً" : "Sound is currently muted")
              : (isRTL ? "سيصدر صوت عند وصول إشعار جديد" : "Sound will play when new notifications arrive")
            }
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSoundToggle;
