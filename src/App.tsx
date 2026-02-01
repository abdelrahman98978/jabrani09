import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { CompareProvider } from "@/contexts/CompareContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useSettings } from "@/hooks/useSettings";
import Index from "./pages/Index";
import CarsPage from "./pages/CarsPage";
import ComparePage from "./pages/ComparePage";
import CookieConsent from "@/components/CookieConsent";
import NewsletterPopup from "@/components/NewsletterPopup";
import ScrollToTop from "@/components/ScrollToTop";
import ReadingProgress from "@/components/ReadingProgress";
import PushNotificationManager from "@/components/PushNotificationManager";
import AnnouncementBar from "@/components/AnnouncementBar";
import CompareDrawer from "@/components/CompareDrawer";
import RealtimeNotifications from "@/components/RealtimeNotifications";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import CarDetailsPage from "./pages/CarDetailsPage";
import BrandsPage from "./pages/BrandsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import WishlistPage from "./pages/WishlistPage";
import FAQPage from "./pages/FAQPage";
const queryClient = new QueryClient();

function parseColorToHslComponents(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();

  // If already hsl(...), extract inside parentheses
  if (trimmed.toLowerCase().startsWith("hsl")) {
    const match = trimmed.match(/hsl\(([^)]+)\)/i);
    if (match?.[1]) {
      return match[1].trim();
    }
    return null;
  }

  // If hex, convert to HSL components
  if (trimmed.startsWith("#")) {
    const hex = trimmed.replace("#", "");
    let r: number, g: number, b: number;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    const H = Math.round(h * 360);
    const S = Math.round(s * 100);
    const L = Math.round(l * 100);

    return `${H} ${S}% ${L}%`;
  }

  return null;
}

const AppInner = () => {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    const primary = parseColorToHslComponents(settings.primary_color);
    const secondary = parseColorToHslComponents(settings.secondary_color);
    const accent = parseColorToHslComponents(settings.accent_color);

    if (primary) root.style.setProperty("--primary", primary);
    if (secondary) root.style.setProperty("--secondary", secondary);
    if (accent) root.style.setProperty("--accent", accent);
  }, [settings]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <CompareProvider>
            <WishlistProvider>
              <TooltipProvider>
              <AnnouncementBar />
              <ReadingProgress />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/cars" element={<CarsPage />} />
                    <Route path="/cars/:id" element={<CarDetailsPage />} />
                    <Route path="/compare" element={<ComparePage />} />
                    <Route path="/brands" element={<BrandsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                    <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                    <Route path="/unsubscribe" element={<UnsubscribePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <CookieConsent />
                  <NewsletterPopup />
                  <ScrollToTop />
                  <PushNotificationManager />
                  <CompareDrawer />
                  <RealtimeNotifications />
              </BrowserRouter>
              </TooltipProvider>
            </WishlistProvider>
          </CompareProvider>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppInner />
  </QueryClientProvider>
);

export default App;
