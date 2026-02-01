import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  car_id: string;
  quantity: number;
  car?: {
    id: string;
    name_ar: string;
    name: string;
    price: number;
    main_image?: string;
    model: string;
    year: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  totalPrice: number;
  addToCart: (carId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getSessionId = () => {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      let query = supabase
        .from("cart_items")
        .select(`
          id,
          car_id,
          quantity,
          cars (
            id,
            name_ar,
            name,
            price,
            main_image,
            model,
            year
          )
        `);

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("session_id", sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedItems = (data || []).map((item: any) => ({
        id: item.id,
        car_id: item.car_id,
        quantity: item.quantity,
        car: item.cars
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (carId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      // Check if item already exists
      const existingItem = items.find(item => item.car_id === carId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
        return;
      }

      const insertData: any = {
        car_id: carId,
        quantity: 1
      };

      if (user) {
        insertData.user_id = user.id;
      } else {
        insertData.session_id = sessionId;
      }

      const { error } = await supabase.from("cart_items").insert(insertData);

      if (error) throw error;

      await fetchCart();

      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة السيارة إلى سلة المشتريات"
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message
      });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: "تم الحذف",
        description: "تم حذف العنصر من سلة المشتريات"
      });
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message
      });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;

      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message
      });
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const sessionId = getSessionId();

      let query = supabase.from("cart_items").delete();

      if (user) {
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("session_id", sessionId);
      }

      const { error } = await query;

      if (error) throw error;

      setItems([]);

      toast({
        title: "تم المسح",
        description: "تم مسح سلة المشتريات"
      });
    } catch (error: any) {
      console.error("Error clearing cart:", error);
    }
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + (item.car?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
