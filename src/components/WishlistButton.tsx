import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        className={cn(
          "h-9 w-9 transition-all",
          inWishlist && "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:border-red-800",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            inWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground"
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? "destructive" : "outline"}
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      <Heart
        className={cn(
          "h-4 w-4",
          inWishlist && "fill-current"
        )}
      />
      {inWishlist
        ? (isRTL ? "إزالة من المفضلة" : "Remove from Wishlist")
        : (isRTL ? "أضف للمفضلة" : "Add to Wishlist")}
    </Button>
  );
};

export default WishlistButton;
