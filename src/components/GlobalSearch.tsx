import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Car, Building2, FileText, ArrowRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pages = [
  { path: "/", label: { ar: "الرئيسية", en: "Home" }, icon: FileText },
  { path: "/cars", label: { ar: "السيارات", en: "Cars" }, icon: Car },
  { path: "/brands", label: { ar: "الماركات", en: "Brands" }, icon: Building2 },
  { path: "/about", label: { ar: "من نحن", en: "About" }, icon: FileText },
  { path: "/contact", label: { ar: "اتصل بنا", en: "Contact" }, icon: FileText },
  { path: "/faq", label: { ar: "الأسئلة الشائعة", en: "FAQ" }, icon: FileText },
  { path: "/wishlist", label: { ar: "المفضلة", en: "Wishlist" }, icon: FileText },
  { path: "/compare", label: { ar: "المقارنة", en: "Compare" }, icon: FileText },
];

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: cars } = useQuery({
    queryKey: ["global-search-cars", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const { data } = await supabase
        .from("cars")
        .select("id, name_ar, name, model, year, main_image, price")
        .or(`name_ar.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
        .limit(5);
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const { data: brands } = useQuery({
    queryKey: ["global-search-brands", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const { data } = await supabase
        .from("brands")
        .select("id, name_ar, name, logo_url")
        .or(`name_ar.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .eq("is_active", true)
        .limit(5);
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });

  const filteredPages = pages.filter(page => {
    if (!searchTerm) return true;
    const label = page.label[isRTL ? "ar" : "en"];
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const allResults = [
    ...filteredPages.map(p => ({ type: "page" as const, ...p })),
    ...(cars?.map(c => ({ type: "car" as const, ...c })) || []),
    ...(brands?.map(b => ({ type: "brand" as const, ...b })) || []),
  ];

  const handleSelect = useCallback((result: typeof allResults[0]) => {
    if (result.type === "page") {
      navigate(result.path);
    } else if (result.type === "car") {
      navigate(`/cars/${result.id}`);
    } else if (result.type === "brand") {
      navigate(`/brands?brand=${result.id}`);
    }
    onOpenChange(false);
    setSearchTerm("");
  }, [navigate, onOpenChange]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(allResults[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, allResults, selectedIndex, handleSelect]);

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(isRTL ? "ar-SD" : "en-US", {
      maximumFractionDigits: 0,
    }).format(price);
    const symbol = settings?.currency_symbol || (isRTL ? "ج.س" : "SDG");
    return `${formatted} ${symbol}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRTL ? "ابحث عن سيارات، ماركات، صفحات..." : "Search cars, brands, pages..."}
            className="border-0 focus-visible:ring-0 text-lg h-14"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {allResults.length === 0 && searchTerm.length >= 2 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? "لا توجد نتائج" : "No results found"}
            </div>
          ) : (
            <div className="space-y-1 px-2">
              {/* Pages Section */}
              {filteredPages.length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {isRTL ? "الصفحات" : "Pages"}
                  </div>
                  {filteredPages.map((page, index) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.path}
                        onClick={() => handleSelect({ type: "page", ...page })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors",
                          selectedIndex === index
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{page.label[isRTL ? "ar" : "en"]}</span>
                        <ArrowRight className="h-4 w-4 opacity-50" />
                      </button>
                    );
                  })}
                </>
              )}

              {/* Cars Section */}
              {cars && cars.length > 0 && (
                <>
                  <div className="px-2 py-1 mt-2 text-xs font-medium text-muted-foreground">
                    {isRTL ? "السيارات" : "Cars"}
                  </div>
                  {cars.map((car, i) => {
                    const index = filteredPages.length + i;
                    return (
                      <button
                        key={car.id}
                        onClick={() => handleSelect({ type: "car", ...car })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors",
                          selectedIndex === index
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="w-12 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={car.main_image || "/placeholder.svg"}
                            alt={car.name_ar}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {isRTL ? car.name_ar : car.name} {car.model}
                          </p>
                          <p className="text-xs opacity-70">{car.year}</p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {formatPrice(car.price)}
                        </Badge>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Brands Section */}
              {brands && brands.length > 0 && (
                <>
                  <div className="px-2 py-1 mt-2 text-xs font-medium text-muted-foreground">
                    {isRTL ? "الماركات" : "Brands"}
                  </div>
                  {brands.map((brand, i) => {
                    const index = filteredPages.length + (cars?.length || 0) + i;
                    return (
                      <button
                        key={brand.id}
                        onClick={() => handleSelect({ type: "brand", ...brand })}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors",
                          selectedIndex === index
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0 p-1">
                          <img
                            src={brand.logo_url || "/placeholder.svg"}
                            alt={brand.name_ar}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="flex-1">{isRTL ? brand.name_ar : brand.name}</span>
                        <ArrowRight className="h-4 w-4 opacity-50" />
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↓</kbd>
              {isRTL ? "للتنقل" : "to navigate"}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
              {isRTL ? "للاختيار" : "to select"}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3" />K
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
