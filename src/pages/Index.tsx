import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <TopBar />
      <Navbar />
      <main>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection />
        </motion.div>

        <section className="relative z-20 -mt-8 md:-mt-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <InventorySearch />
            </motion.div>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <FeaturedCars />
        </motion.div>

        <StatsCounter />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <BrandsSection />
        </motion.div>

        <WhyUsSection />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <TestimonialsSection />
        </motion.div>

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
