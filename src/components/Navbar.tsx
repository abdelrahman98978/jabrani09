import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings, Heart, Package, ShoppingCart, ShieldCheck } from "lucide-react";
import showroomLogo from "@/assets/sudex-logo.jpg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartSheet from "@/components/CartSheet";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === "abdo12uk@gmail.com");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.email === "abdo12uk@gmail.com");
    });

    const handleScroll = () => {
      setIsAtTop(window.scrollY < 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/cars", label: t.nav.cars },
    { href: "/brands", label: t.nav.brands },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  const siteName = language === "ar"
    ? (settings?.showroom_name || t.siteName)
    : (settings?.showroom_name_en || t.siteName);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-1000 ${
          isAtTop ? "py-10 bg-transparent" : "py-5 bg-black/90 backdrop-blur-3xl border-b border-white/5"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between">
            {/* Identity Exhibition */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                 <div className="h-14 w-auto overflow-hidden border border-white/5 bg-white/5 group-hover:border-primary/20 transition-all duration-1000 relative">
                    <img 
                      src={showroomLogo} 
                      alt="" 
                      className={`h-full w-auto transition-all duration-1000 grayscale ${isAtTop ? 'scale-110 opacity-70' : 'scale-105 opacity-100 grayscale-0'}`} 
                    />
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 {/* Premium Glow */}
                 <div className="absolute -bottom-2 -left-2 h-8 w-8 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              </div>
              <div className="ms-8 flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-white uppercase group-hover:text-primary transition-all duration-700 leading-none">
                  {siteName}
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                   <ShieldCheck className="h-2.5 w-2.5 text-primary opacity-40" />
                   <span className="text-[9px] tracking-[0.8em] text-white/20 uppercase font-black">
                      Sovereign Atelier
                   </span>
                </div>
              </div>
            </Link>

            {/* Navigation Array */}
            <nav className="hidden lg:flex items-center gap-16">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-[11px] font-black uppercase tracking-[0.6em] transition-all relative py-3 group ${
                    isActive(link.href) ? "text-primary" : "text-white/30 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  <AnimatePresence>
                    {isActive(link.href) && (
                      <motion.span 
                        layoutId="nav-active"
                        className="absolute bottom-0 inset-x-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(196,164,132,0.5)]"
                        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                      />
                    )}
                  </AnimatePresence>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </nav>

            {/* Tactical Actions */}
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8 px-8 border-x border-white/5">
                <button 
                   onClick={() => setSearchOpen(true)}
                   className="text-white/40 hover:text-primary transition-colors group p-2"
                >
                   <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                         <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                      </svg>
                   </motion.div>
                </button>
                <NotificationCenter />
                <LanguageSwitcher />
                <Link to="/wishlist" className="text-white/40 hover:text-red-400 transition-all group">
                   <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Heart className="h-4 w-4" />
                   </motion.div>
                </Link>
              </div>

              <CartSheet />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center group outline-none">
                      <Avatar className="h-11 w-11 border border-white/5 rounded-none p-1 group-hover:border-primary/40 transition-all duration-700 bg-surface-low/30">
                        <AvatarImage src={user.user_metadata.avatar_url} className="rounded-none grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <AvatarFallback className="bg-transparent text-white text-[10px] font-black rounded-none">
                          {getInitials(user.user_metadata.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-72 mt-6 bg-black border border-white/5 rounded-none p-0 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                  >
                    <div className="p-8 bg-surface-low/50 border-b border-white/5">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="h-8 w-1 bg-primary" />
                          <p className="text-[12px] uppercase tracking-[0.4em] font-black text-white">{user.user_metadata.full_name || "AUTHORIZED CLIENT"}</p>
                       </div>
                       <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 truncate italic">{user.email}</p>
                    </div>
                    <div className="p-2">
                       <DropdownMenuItem onClick={() => navigate("/profile")} className="py-4 px-6 hover:bg-white/5 focus:bg-white/5 cursor-pointer text-[10px] uppercase tracking-[0.5em] text-white/40 group">
                         <User className="me-4 h-3.5 w-3.5 transition-colors group-hover:text-primary" />
                         {isRTL ? "ملف التعريف" : "Client Profile"}
                       </DropdownMenuItem>
                       {isAdmin && (
                         <DropdownMenuItem onClick={() => navigate("/admin")} className="py-4 px-6 hover:bg-primary/5 focus:bg-primary/5 cursor-pointer text-[10px] uppercase tracking-[0.5em] text-primary font-black group">
                           <Settings className="me-4 h-3.5 w-3.5" />
                           {isRTL ? "لوحة التحكم" : "Institutional Admin"}
                         </DropdownMenuItem>
                       )}
                       <DropdownMenuSeparator className="bg-white/5 mx-6" />
                       <DropdownMenuItem onClick={handleLogout} className="py-4 px-6 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer text-[10px] uppercase tracking-[0.5em] text-red-500/60 font-black">
                         <LogOut className="me-4 h-3.5 w-3.5" />
                         {isRTL ? "خروج" : "Terminate Session"}
                       </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <button className="h-14 px-10 bg-primary text-black text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white transition-all duration-1000 shadow-[0_0_30px_rgba(196,164,132,0.1)]">
                     {isRTL ? "الدخول" : "PORTAL"}
                  </button>
                </Link>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden text-white p-2"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Interface */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              className="fixed inset-y-0 right-0 w-full bg-black z-[60] flex flex-col lg:hidden"
            >
              <div className="p-10 flex justify-between items-center border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[11px] uppercase tracking-[0.6em] text-white font-black">Archive Access</span>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="h-12 w-12 flex items-center justify-center border border-white/10 rounded-full text-white"><X className="h-6 w-6" /></button>
              </div>
              <ScrollArea className="flex-1">
                <nav className="flex flex-col gap-1 px-10 py-20">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-5xl font-black tracking-tighter uppercase transition-colors block py-4 ${
                          isActive(link.href) ? "text-primary italic" : "text-white/20 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </ScrollArea>
              <div className="p-10 border-t border-white/5 space-y-12 bg-surface-low/30 pb-20">
                 <div className="flex items-center justify-between">
                    <LanguageSwitcher />
                    <NotificationCenter />
                 </div>
                 {!user && (
                   <Link to="/auth" onClick={() => setIsOpen(false)}>
                     <button className="w-full h-20 bg-primary text-black text-[12px] font-black uppercase tracking-[0.8em]">
                       Secured Entry
                     </button>
                   </Link>
                 )}
                 <div className="text-center text-[9px] uppercase tracking-[0.4em] text-white/10 font-black">
                    Institutional Record // Jabrani Sovereign
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Search Interface */}
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </motion.nav>
      
      {/* Search Trigger for Desktop via Hotkeys */}
      <div className="sr-only">
         Press CMD+K to open search
      </div>
    </>
  );
};

export default Navbar;
