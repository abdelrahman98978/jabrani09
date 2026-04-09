import { Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistButtonProps {
  carId: string;
  variant?: "icon" | "full";
  className?: string;
}

const WishlistButton = ({ carId, variant = "icon", className }: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const inWishlist = isInWishlist(carId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(carId);
    } else {
      await addToWishlist(carId);
    }
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={cn(
          "w-12 h-12 flex items-center justify-center transition-all duration-700 border relative overflow-hidden group/wish",
          inWishlist 
            ? "bg-red-500/10 border-red-500/20 text-red-500" 
            : "bg-black/60 backdrop-blur-3xl border-white/5 text-white/40 hover:text-white hover:border-white/20",
          className
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={inWishlist ? "filled" : "outline"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-all duration-700",
                inWishlist ? "fill-red-500" : "fill-transparent group-hover/wish:text-red-400"
              )}
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Heartbeat Glow */}
        {inWishlist && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-x-0 h-1 bottom-0 bg-red-500 blur-md"
          />
        )}
      </motion.button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "h-14 px-8 flex items-center gap-4 transition-all duration-1000 font-black text-[10px] uppercase tracking-[0.5em] border group",
        inWishlist 
          ? "bg-red-500 border-red-500 text-white" 
          : "bg-surface-low border-white/5 text-white/20 hover:text-white hover:border-white/10",
        className
      )}
    >
      <div className="relative">
         <Heart className={cn("h-4 w-4 transition-all", inWishlist ? "fill-white" : "fill-transparent group-hover:text-red-400")} />
         <AnimatePresence>
            {inWishlist && (
               <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-white rounded-full"
               />
            )}
         </AnimatePresence>
      </div>
      {inWishlist
        ? (isRTL ? "في المجموعة الخاصة" : "PRIVATE_COLLECTION")
        : (isRTL ? "أضف للمجموعة" : "ARCHIVE_ASSET")}
    </button>
  );
};

export default WishlistButton;
