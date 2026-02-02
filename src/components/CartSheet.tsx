import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import CheckoutDialog from "./CheckoutDialog";

interface CartSheetProps {
  isTransparent?: boolean;
}

const CartSheet = ({ isTransparent = false }: CartSheetProps) => {
  const { items, loading, itemCount, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data: settings } = useSettings();

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = settings?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${isTransparent
            ? 'text-white hover:bg-white/10 hover:text-white nav-icon-shadow'
            : ''
            }`}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className={`absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs ${isTransparent
              ? 'bg-white text-primary'
              : 'bg-primary text-primary-foreground'
              }`}>
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isRTL ? "سلة المشتريات" : "Shopping Cart"}
            {itemCount > 0 && (
              <Badge variant="secondary">{itemCount}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {isRTL ? "السلة فارغة" : "Your cart is empty"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isRTL ? "أضف سيارات إلى سلتك للمتابعة" : "Add cars to your cart to continue"}
            </p>
            <Link to="/cars">
              <Button>
                {isRTL ? "تصفح السيارات" : "Browse Cars"}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.car?.main_image || "/placeholder.svg"}
                        alt={item.car?.name_ar || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {item.car?.name_ar}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.car?.model} - {item.car?.year}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatPrice(item.car?.price || 0)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive ms-auto"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>{isRTL ? "المجموع" : "Total"}</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>

              <div className="grid gap-2">
                <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
                  {isRTL ? "إتمام الطلب" : "Checkout"}
                </Button>
                <Button variant="outline" onClick={clearCart} className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  {isRTL ? "مسح السلة" : "Clear Cart"}
                </Button>
              </div>
            </div>
          </>
        )}

        <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
