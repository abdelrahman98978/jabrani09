import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";

interface CompareContextType {
  compareItems: string[];
  addToCompare: (carId: string) => void;
  removeFromCompare: (carId: string) => void;
  clearCompare: () => void;
  isInCompare: (carId: string) => boolean;
  compareCount: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const { language } = useLanguage();
  const isRTL = language === "ar";

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("compare-items");
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem("compare-items");
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("compare-items", JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (carId: string) => {
    if (compareItems.includes(carId)) {
      toast.info(isRTL ? "السيارة موجودة بالفعل في المقارنة" : "Car already in compare list");
      return;
    }
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast.warning(isRTL ? `الحد الأقصى ${MAX_COMPARE_ITEMS} سيارات للمقارنة` : `Maximum ${MAX_COMPARE_ITEMS} cars for comparison`);
      return;
    }
    setCompareItems((prev) => [...prev, carId]);
    toast.success(isRTL ? "تمت الإضافة للمقارنة" : "Added to compare");
  };

  const removeFromCompare = (carId: string) => {
    setCompareItems((prev) => prev.filter((id) => id !== carId));
    toast.info(isRTL ? "تمت الإزالة من المقارنة" : "Removed from compare");
  };

  const clearCompare = () => {
    setCompareItems([]);
    toast.info(isRTL ? "تم مسح قائمة المقارنة" : "Compare list cleared");
  };

  const isInCompare = (carId: string) => compareItems.includes(carId);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareItems.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};
