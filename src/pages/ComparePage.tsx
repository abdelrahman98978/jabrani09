import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCompare } from "@/contexts/CompareContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowRight, ArrowLeft, GitCompare, Car, Calendar, Fuel, Gauge, Palette, Settings } from "lucide-react";

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const { data: cars, isLoading } = useQuery({
    queryKey: ["compare-cars-full", compareItems],
    queryFn: async () => {
      if (compareItems.length === 0) return [];
      const { data } = await supabase
        .from("cars")
        .select("*, brands(name, name_ar)")
        .in("id", compareItems);
      return data || [];
    },
    enabled: compareItems.length > 0,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const fuelTypeAr: Record<string, string> = {
    petrol: "بنزين",
    diesel: "ديزل",
    electric: "كهربائي",
    hybrid: "هايبرد",
  };

  const transmissionAr: Record<string, string> = {
    automatic: "أوتوماتيك",
    manual: "عادي",
  };

  const specs = [
    { key: "price", label: isRTL ? "السعر" : "Price", icon: null, format: (v: number) => formatPrice(v) },
    { key: "year", label: isRTL ? "السنة" : "Year", icon: Calendar },
    { key: "mileage", label: isRTL ? "المسافة" : "Mileage", icon: Gauge, format: (v: number) => `${v?.toLocaleString()} ${isRTL ? "كم" : "km"}` },
    { key: "fuel_type", label: isRTL ? "الوقود" : "Fuel", icon: Fuel, format: (v: string) => isRTL ? fuelTypeAr[v] || v : v },
    { key: "transmission", label: isRTL ? "ناقل الحركة" : "Transmission", icon: Settings, format: (v: string) => isRTL ? transmissionAr[v] || v : v },
    { key: "engine_size", label: isRTL ? "المحرك" : "Engine", icon: Car },
    { key: "color", label: isRTL ? "اللون" : "Color", icon: Palette, format: (v: string, car: any) => isRTL ? car.color_ar || v : v },
  ];

  // Find best values for highlighting
  const getBestValue = (key: string) => {
    if (!cars || cars.length === 0) return null;
    if (key === "price") {
      return Math.min(...cars.map((c: any) => c.price || Infinity));
    }
    if (key === "year") {
      return Math.max(...cars.map((c: any) => c.year || 0));
    }
    if (key === "mileage") {
      return Math.min(...cars.map((c: any) => c.mileage || Infinity));
    }
    return null;
  };

  const isBestValue = (key: string, value: any) => {
    const best = getBestValue(key);
    if (best === null) return false;
    return value === best;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <GitCompare className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                {isRTL ? "مقارنة السيارات" : "Compare Cars"}
              </h1>
            </div>
            {compareItems.length > 0 && (
              <Button variant="outline" onClick={clearCompare} className="text-destructive">
                <Trash2 className="h-4 w-4 me-2" />
                {isRTL ? "مسح الكل" : "Clear All"}
              </Button>
            )}
          </div>

          {compareItems.length === 0 ? (
            <Card className="p-12 text-center">
              <GitCompare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">
                {isRTL ? "لم تختر أي سيارات للمقارنة" : "No cars selected for comparison"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isRTL ? "أضف سيارات من صفحة السيارات لبدء المقارنة" : "Add cars from the cars page to start comparing"}
              </p>
              <Link to="/cars">
                <Button variant="gold">
                  {isRTL ? "تصفح السيارات" : "Browse Cars"}
                  {isRTL ? <ArrowLeft className="ms-2 h-4 w-4" /> : <ArrowRight className="ms-2 h-4 w-4" />}
                </Button>
              </Link>
            </Card>
          ) : compareItems.length === 1 ? (
            <Card className="p-12 text-center">
              <GitCompare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">
                {isRTL ? "أضف سيارة أخرى على الأقل" : "Add at least one more car"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isRTL ? "تحتاج إلى سيارتين على الأقل للمقارنة" : "You need at least 2 cars to compare"}
              </p>
              <Link to="/cars">
                <Button variant="gold">
                  {isRTL ? "أضف سيارة أخرى" : "Add Another Car"}
                </Button>
              </Link>
            </Card>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Header with car images */}
                <thead>
                  <tr>
                    <th className="p-4 text-start bg-secondary/50 rounded-tl-lg min-w-[150px]">
                      {isRTL ? "المواصفة" : "Specification"}
                    </th>
                    {cars?.map((car: any, index: number) => (
                      <th key={car.id} className={`p-4 bg-secondary/50 min-w-[200px] ${index === (cars?.length || 0) - 1 ? 'rounded-tr-lg' : ''}`}>
                        <div className="relative">
                          <button
                            onClick={() => removeFromCompare(car.id)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          <Link to={`/cars/${car.id}`}>
                            <img
                              src={car.main_image || "/placeholder.svg"}
                              alt={isRTL ? car.name_ar : car.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                            <p className="font-bold text-sm">
                              {isRTL ? car.name_ar : car.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {car.brands ? (isRTL ? car.brands.name_ar : car.brands.name) : car.model}
                            </p>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec, index) => (
                    <tr key={spec.key} className={index % 2 === 0 ? "bg-secondary/20" : ""}>
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {spec.icon && <spec.icon className="h-4 w-4 text-primary" />}
                          {spec.label}
                        </div>
                      </td>
                      {cars?.map((car) => {
                        const value = (car as Record<string, unknown>)[spec.key];
                        const displayValue = spec.format ? spec.format(value as never, car) : value;
                        const isBest = isBestValue(spec.key, value);
                        
                        return (
                          <td key={car.id} className="p-4 text-center">
                            <span className={isBest ? "text-primary font-bold" : ""}>
                              {(displayValue as React.ReactNode) || "-"}
                            </span>
                            {isBest && spec.key === "price" && (
                              <Badge variant="secondary" className="ms-2 text-xs">
                                {isRTL ? "الأقل" : "Lowest"}
                              </Badge>
                            )}
                            {isBest && spec.key === "year" && (
                              <Badge variant="secondary" className="ms-2 text-xs">
                                {isRTL ? "الأحدث" : "Newest"}
                              </Badge>
                            )}
                            {isBest && spec.key === "mileage" && (
                              <Badge variant="secondary" className="ms-2 text-xs">
                                {isRTL ? "الأقل" : "Lowest"}
                              </Badge>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComparePage;
