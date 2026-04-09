import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Loader2, 
  X, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Database,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import CheckoutDialog from "./CheckoutDialog";
import { motion, AnimatePresence } from "framer-motion";

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
          className={`relative group ${isTransparent
            ? 'text-white hover:bg-white/10 hover:text-white nav-icon-shadow'
            : 'text-foreground hover:bg-foreground/5'
            }`}
        >
          <ShoppingCart className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
          {itemCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-black text-[9px] font-black flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(196,164,132,0.5)]"
            >
               {itemCount}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isRTL ? "left" : "right"} 
        className="w-full sm:max-w-xl bg-black border-white/5 p-0 flex flex-col gap-0 text-white selection:bg-primary/30"
      >
        {/* Manifest Header */}
        <div className="p-12 border-b border-white/5 bg-surface-low/30 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] rotate-12">
             <Database className="h-40 w-40" />
          </div>
          
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-primary font-black">
                <FileText className="h-3 w-3" />
                {isRTL ? "بيان الاستحواذ" : "ACQUISITION MANIFEST"}
             </div>
             <SheetHeader className="space-y-0">
               <SheetTitle className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter leading-none">
                  {isRTL ? "سلة" : "Sovereign"} <span className="text-white/20">Select.</span>
               </SheetTitle>
             </SheetHeader>
          </div>
        </div>

        {/* Scrollable Ledger */}
        <div className="flex-1 overflow-hidden flex flex-col pt-8">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/10 font-black">Retrieving Ledger...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-12">
              <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                 <ShoppingCart className="h-10 w-10 text-white/5" />
              </div>
              <div className="space-y-4">
                 <h3 className="text-xl font-bold uppercase tracking-tighter">
                   {isRTL ? "البيان فارغ" : "Manifest Void"}
                 </h3>
                 <p className="text-[11px] uppercase tracking-[0.4em] text-white/20 max-w-[240px] leading-relaxed mx-auto">
                   {isRTL ? "أضف سيارات إلى سلتك للمتابعة" : "The acquisition ledger currently contains zero institutional records."}
                 </p>
              </div>
              <Link to="/cars" className="w-full max-w-[200px]">
                <Button className="w-full bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-black transition-all duration-700 h-16 uppercase text-[11px] tracking-[0.4em] font-black">
                  {isRTL ? "تصفح السيارات" : "Browse Inventory"}
                </Button>
              </Link>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-12">
              <div className="space-y-8 py-8">
                <AnimatePresence>
                  {items.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative flex gap-8 p-6 bg-surface-low border border-white/5 hover:border-primary/20 transition-all duration-700 overflow-hidden"
                    >
                      <div className="w-24 h-24 shrink-0 rounded bg-black overflow-hidden border border-white/5 relative">
                        <img
                          src={item.car?.main_image || "/placeholder.svg"}
                          alt={item.car?.name_ar || ""}
                          className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-primary font-black">Record #{item.id.slice(0, 4)}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-white/10 hover:text-red-500 transition-colors"
                            >
                               <X className="h-4 w-4" />
                            </button>
                          </div>
                          <h4 className="text-lg font-black uppercase text-white tracking-tighter group-hover:text-primary transition-colors truncate">
                            {isRTL ? item.car?.name_ar : item.car?.name}
                          </h4>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
                            {item.car?.model} // {item.car?.year}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pb-2">
                           <div className="flex items-center gap-6 text-white/40">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="hover:text-primary transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="hover:text-primary transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                           </div>
                           <span className="text-sm font-black text-primary">
                             {formatPrice(item.car?.price || 0)}
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Manifest Footer */}
        {items.length > 0 && (
          <div className="p-12 border-t border-white/5 bg-surface-low space-y-10 shrink-0">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.6em] text-white/20 font-black">{isRTL ? "المجموع الفرعي" : "BASE INDEX"}</span>
                  <span className="text-lg font-black tracking-tighter text-white/40 italic">{formatPrice(totalPrice)}</span>
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[12px] uppercase tracking-[0.8em] text-white/40 font-black">{isRTL ? "المجموع الكلي" : "TOTAL VALUATION"}</span>
                  <span className="text-3xl font-black tracking-tighter text-primary shadow-primary/20 drop-shadow-sm">{formatPrice(totalPrice)}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button 
                className="w-full h-20 bg-primary text-black hover:bg-white hover:text-black transition-all duration-700 uppercase font-black text-[12px] tracking-[0.8em] shadow-[0_0_30px_rgba(196,164,132,0.15)] group" 
                size="lg" 
                onClick={() => setCheckoutOpen(true)}
              >
                {isRTL ? "إتمام البروتوكول" : "EXECUTE PROTOCOL"}
                <ArrowRight className="ms-4 h-4 w-4 transition-transform group-hover:translate-x-2" />
              </Button>
              <button 
                onClick={clearCart} 
                className="w-full py-4 text-[9px] uppercase tracking-[0.5em] text-white/10 hover:text-red-500 transition-colors font-black flex items-center justify-center gap-4 group"
              >
                <Trash2 className="h-3 w-3 transition-transform group-hover:scale-125" />
                {isRTL ? "تصفير البيان" : "VOID ENTIRE MANIFEST"}
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4 text-[8px] uppercase tracking-[0.4em] font-black text-white/5 border-t border-white/5">
               <span>Secured by Sovereign Ledger Alpha</span>
               <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" />
                  STABLE INDEX
               </div>
            </div>
          </div>
        )}

        <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
