import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard, { mapCarToCardData } from "@/components/CarCard";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
        .select("*, brands(name, name_ar)")
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
    <div className="min-h-screen bg-black selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-40 pb-32">
        <div className="container mx-auto px-6 md:px-12">
          {/* Sovereign Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 border-b border-white/5 pb-10"
          >
            <div className="space-y-4">
               <div className="flex items-center gap-4 text-primary">
                  <Heart className="h-6 w-6 fill-primary/20" />
                  <span className="text-[10px] uppercase tracking-[0.8em] font-black">Private Selection</span>
               </div>
               <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">
                 The <span className="text-primary">Curated</span> <br /> Collection
               </h1>
            </div>
            {wishlistItems.length > 0 && (
              <button 
                onClick={handleClearAll} 
                className="text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-destructive transition-colors flex items-center gap-3 font-black"
              >
                <Trash2 className="h-4 w-4" />
                {isRTL ? "تطهير المجموعة" : "Dissolve Collection"}
              </button>
            )}
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoading || wishlistLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
              >
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-96 bg-surface-low border border-white/5 animate-pulse" />
                ))}
              </motion.div>
            ) : wishlistItems.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-40 border border-white/5 bg-surface-low"
              >
                <div className="max-w-xs mx-auto space-y-8">
                  <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto opacity-20">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl uppercase tracking-[0.4em] text-white/40">Your Private Vault is Empty</h3>
                  <Link to="/cars" className="inline-block px-12 py-5 bg-primary text-black text-[11px] uppercase tracking-[0.4em] font-black hover:bg-white transition-all duration-700 flex items-center justify-center gap-4">
                    {isRTL ? "تصفح القائمة" : "Acquire Masterpieces"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12"
              >
                {cars?.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
                  >
                    <CarCard car={mapCarToCardData(car)} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
