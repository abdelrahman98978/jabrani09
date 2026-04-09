import { GitCompare, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CompareButtonProps {
  carId: string;
  variant?: "icon" | "full";
  className?: string;
}

const CompareButton = ({ carId, variant = "icon", className }: CompareButtonProps) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const inCompare = isInCompare(carId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(carId);
    } else {
      addToCompare(carId);
    }
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={cn(
          "w-12 h-12 flex items-center justify-center transition-all duration-500 border relative overflow-hidden group/comp",
          inCompare 
            ? "bg-primary border-primary text-black" 
            : "bg-black/60 backdrop-blur-md border-white/10 text-white/40 hover:text-white hover:border-white/20",
          className
        )}
        title={inCompare ? (isRTL ? "إزالة من المقارنة" : "REMOVE_PROTOCOL") : (isRTL ? "أضف للمقارنة" : "INITIATE_COMPARISON")}
      >
        <AnimatePresence mode="wait">
          {inCompare ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="git"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <GitCompare className="h-4 w-4 transition-transform group-hover/comp:rotate-180 duration-1000" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtle Glow for Active State */}
        {inCompare && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
      </motion.button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "h-14 px-8 flex items-center gap-4 transition-all duration-700 font-black text-[10px] uppercase tracking-[0.4em] border",
        inCompare 
          ? "bg-primary border-primary text-black" 
          : "bg-surface-low border-white/5 text-white/40 hover:text-white hover:border-white/10",
        className
      )}
    >
      <div className="relative">
         {inCompare ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
         {!inCompare && <div className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />}
      </div>
      {inCompare ? (isRTL ? "في المقارنة" : "ARCHIVED_COMPARE") : (isRTL ? "أضف للمقارنة" : "START_PROTOCOL")}
    </button>
  );
};

export default CompareButton;
