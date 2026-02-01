import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, X, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const notifications = [
    { en: "Someone just purchased a Mercedes AMG GT", ar: "قام شخص بشراء مرسيدس AMG GT للتو", time: "2m ago" },
    { en: "New Offer: 10% Discount on BMW M4", ar: "عرض جديد: خصم 10% على BMW M4", time: "5m ago" },
    { en: "Ali from Riyadh reserved a Porsche 911", ar: "علي من الرياض حجز بورش 911", time: "12m ago" },
    { en: "Sarah viewed Range Rover Autobiography", ar: "سارة شاهدت رنج روفر أوتوبيوغرافي", time: "just now" },
];

const SalesNotification = () => {
    const { language } = useLanguage();
    const isRTL = language === "ar";
    const [currentNotification, setCurrentNotification] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initial delay
        const initialTimeout = setTimeout(() => {
            showRandomNotification();
        }, 5000);

        const interval = setInterval(() => {
            showRandomNotification();
        }, 20000); // Show every 20 seconds

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const showRandomNotification = () => {
        const randomIndex = Math.floor(Math.random() * notifications.length);
        setCurrentNotification(randomIndex);
        setIsVisible(true);

        // Hide after 6 seconds
        setTimeout(() => {
            setIsVisible(false);
        }, 6000);
    };

    if (currentNotification === null) return null;

    const notification = notifications[currentNotification];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`fixed bottom-6 ${isRTL ? "right-6" : "left-6"} z-50 max-w-sm w-full md:w-auto`}
                >
                    <div className="bg-white dark:bg-zinc-900 border border-border/50 shadow-2xl rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden backdrop-blur-xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>

                        {/* Icon */}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-sm font-bold text-foreground">
                                {isRTL ? notification.ar : notification.en}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="absolute bottom-0 left-0 h-1 bg-primary/20"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SalesNotification;
