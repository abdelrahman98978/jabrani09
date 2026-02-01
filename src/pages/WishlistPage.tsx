import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard, { mapCarToCardData } from "@/components/CarCard";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, isLoading: wishlistLoading } = useWishlist();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: cars, isLoading } = useQuery({
    queryKey: ["wishlist-cars", wishlistItems],
    queryFn: async () => {
      if (wishlistItems.length === 0) return [];
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .in("id", wishlistItems);
      if (error) throw error;
      return data;
    },
    enabled: wishlistItems.length > 0,
  });

  const handleClearAll = async () => {
    for (const carId of wishlistItems) {
      await removeFromWishlist(carId);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              {isRTL ? "قائمة المفضلة" : "My Wishlist"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {wishlistItems.length} {isRTL ? "سيارة في قائمتك" : "cars in your list"}
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 me-2" />
              {isRTL ? "مسح الكل" : "Clear All"}
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading || wishlistLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-semibold mb-2">
              {isRTL ? "قائمة المفضلة فارغة" : "Your wishlist is empty"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? "ابدأ بإضافة السيارات التي تعجبك لحفظها هنا" 
                : "Start adding cars you like to save them here"}
            </p>
            <Button asChild variant="gold">
              <Link to="/cars">
                {isRTL ? "تصفح السيارات" : "Browse Cars"}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars?.map((car) => (
              <CarCard key={car.id} car={mapCarToCardData(car)} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
