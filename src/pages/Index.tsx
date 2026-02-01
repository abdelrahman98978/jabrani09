import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedCars from "@/components/FeaturedCars";
import BrandsSection from "@/components/BrandsSection";
import WhyUsSection from "@/components/WhyUsSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatBot from "@/components/AIChatBot";
import Newsletter from "@/components/Newsletter";
import InventorySearch from "@/components/InventorySearch";
import TestimonialsSection from "@/components/TestimonialsSection";
import StatsCounter from "@/components/StatsCounter";
import CTABanner from "@/components/CTABanner";
import TopBar from "@/components/TopBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />
      <main>
        <HeroSection />
        <InventorySearch />
        <FeaturedCars />
        <StatsCounter />
        <BrandsSection />
        <WhyUsSection />
        <TestimonialsSection />
        <CTABanner />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppButton />
      <AIChatBot />
    </div>
  );
};

export default Index;
