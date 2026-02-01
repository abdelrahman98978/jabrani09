import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistItems: string[];
  addToWishlist: (carId: string) => Promise<void>;
  removeFromWishlist: (carId: string) => Promise<void>;
  isInWishlist: (carId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "car-wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load wishlist items
  useEffect(() => {
    const loadWishlist = async () => {
      setIsLoading(true);
      try {
        if (userId) {
          // Load from database for logged-in users
          const { data, error } = await supabase
            .from("wishlist")
            .select("car_id")
            .eq("user_id", userId);
          
          if (error) throw error;
          setWishlistItems(data?.map(item => item.car_id) || []);
        } else {
          // Load from localStorage for guests
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          setWishlistItems(stored ? JSON.parse(stored) : []);
        }
      } catch (error) {
        console.error("Error loading wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWishlist();
  }, [userId]);

  // Sync localStorage wishlist to database when user logs in
  useEffect(() => {
    const syncWishlist = async () => {
      if (userId) {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const localItems = JSON.parse(stored) as string[];
          for (const carId of localItems) {
            try {
              await supabase.from("wishlist").upsert({
                user_id: userId,
                car_id: carId,
              }, { onConflict: "user_id,car_id" });
            } catch (error) {
              console.error("Error syncing wishlist item:", error);
            }
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    };
    syncWishlist();
  }, [userId]);

  const addToWishlist = async (carId: string) => {
    try {
      if (userId) {
        const { error } = await supabase.from("wishlist").insert({
          user_id: userId,
          car_id: carId,
        });
        if (error) {
          if (error.code === "23505") {
            // Already exists
            return;
          }
          throw error;
        }
      } else {
        const newItems = [...wishlistItems, carId];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
      }
      setWishlistItems(prev => [...prev, carId]);
      toast.success("تمت الإضافة للمفضلة");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("حدث خطأ");
    }
  };

  const removeFromWishlist = async (carId: string) => {
    try {
      if (userId) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", userId)
          .eq("car_id", carId);
        if (error) throw error;
      } else {
        const newItems = wishlistItems.filter(id => id !== carId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newItems));
      }
      setWishlistItems(prev => prev.filter(id => id !== carId));
      toast.success("تمت الإزالة من المفضلة");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("حدث خطأ");
    }
  };

  const isInWishlist = (carId: string) => wishlistItems.includes(carId);

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isLoading,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
