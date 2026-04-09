import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Car, Phone, User, LogIn, LogOut, Settings, Search, Sparkles, Heart, Package } from "lucide-react";
import showroomLogo from "@/assets/sudex-logo.jpg";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CartSheet from "@/components/CartSheet";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";
import NotificationSoundToggle from "@/components/NotificationSoundToggle";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === "abdo12uk@gmail.com");
      }
    });

    // Auth Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAdmin(session.user.email === "abdo12uk@gmail.com");
      } else {
        setIsAdmin(false);
      }
    });

    // Scroll Handler
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Cleanup
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

  const isTransparent = isAtTop && isHomePage;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ${isTransparent
        ? 'py-8'
        : 'glass-modern py-4 shadow-2xl shadow-black/20'
        }`}
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center group relative">
            <div className="relative">
              <img
                src={showroomLogo}
                alt={siteName}
                className={`h-10 w-10 md:h-14 md:w-14 rounded-none object-cover transition-all duration-1000 ${isTransparent ? 'scale-110 grayscale' : 'scale-100 grayscale-0'}`}
              />
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="ms-4 flex flex-col pt-1">
              <span className={`text-lg md:text-2xl font-light tracking-tighter uppercase ${isTransparent ? 'text-white' : 'text-foreground'}`}>
                {siteName}
              </span>
              <div className="h-[1px] w-0 bg-primary group-hover:w-full transition-all duration-700" />
            </div>
          </Link>

          {/* Minimalist Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-[11px] font-medium uppercase tracking-[0.4em] transition-all relative group py-2 ${isActive(link.href)
                  ? isTransparent ? 'text-white' : 'text-foreground'
                  : isTransparent ? 'text-white/40 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {link.label}
                <motion.span 
                  className="absolute bottom-0 inset-x-0 h-[1.5px] bg-primary origin-left"
                  initial={false}
                  animate={{ scaleX: isActive(link.href) ? 1 : 0 }}
                  transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                />
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <GlobalSearch />

              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className={isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary"}>
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">{t.nav?.wishlist || (isRTL ? "المفضلة" : "Wishlist")}</span>
                </Button>
              </Link>

              <Link to="/profile?tab=orders">
                <Button variant="ghost" size="icon" className={isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-secondary"}>
                  <Package className="h-5 w-5" />
                  <span className="sr-only">{t.nav?.myOrders || (isRTL ? "طلباتي" : "My Orders")}</span>
                </Button>
              </Link>

              <NotificationCenter />
              <ThemeToggle isTransparent={isTransparent} />
              <LanguageSwitcher isTransparent={isTransparent} />
            </div>

            <CartSheet />

            {/* ... user dropdown ... */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-opacity hover:opacity-80">
                    <Avatar className="h-full w-full border border-border/50">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback className="bg-secondary text-foreground text-[10px] font-medium">
                        {getInitials(user.user_metadata.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-4 rounded-lg bg-background/95 backdrop-blur-xl border-border/50">
                  <div className="p-4 border-b border-border/10">
                    <p className="text-xs font-bold truncate">{user.user_metadata.full_name || user.email}</p>
                    <p className="text-[10px] text-muted-foreground truncate tracking-wider">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="py-2.5 px-4 cursor-pointer text-xs">
                    <User className="me-2 h-3.5 w-3.5" />
                    <span>{isRTL ? "حسابي" : "Account"}</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="py-2.5 px-4 cursor-pointer text-xs">
                      <Settings className="me-2 h-3.5 w-3.5" />
                      <span>{isRTL ? "الإدارة" : "Admin"}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="py-2.5 px-4 cursor-pointer text-destructive text-xs">
                    <LogOut className="me-2 h-3.5 w-3.5" />
                    <span>{t.nav?.logout || (isRTL ? "تسجيل الخروج" : "Logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  variant="gold"
                  className="px-8 h-10 transition-all"
                >
                  {t.nav?.login || (isRTL ? "تسجيل الدخول" : "Login")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-secondary'
                }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-2xl border-t border-border/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all ${isActive(link.href)
                    ? 'bg-primary text-white shadow-lg'
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive("/wishlist")
                  ? 'bg-primary text-white shadow-lg'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Heart className="h-5 w-5" />
                {isRTL ? "المفضلة" : "Wishlist"}
              </Link>

              <Link
                to="/profile?tab=orders"
                onClick={() => setIsOpen(false)}
                className={`px-4 py-4 rounded-2xl text-lg font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive("/profile")
                  ? 'bg-primary text-white shadow-lg'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Package className="h-5 w-5" />
                {isRTL ? "طلباتي" : "My Orders"}
              </Link>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50">
                  <span className="text-sm font-bold">{isRTL ? "الوضع المظلم" : "Dark Mode"}</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50">
                  <span className="text-sm font-bold">{isRTL ? "اللغة" : "Language"}</span>
                  <LanguageSwitcher />
                </div>
              </div>


              {/* Mobile Auth Actions */}
              <div className="mt-4 pt-4 border-t border-border/10">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback>{getInitials(user.user_metadata.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate">{user.user_metadata.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link to={isAdmin ? "/admin" : "/profile"} onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-start gap-2 h-12 text-base" variant="outline">
                        {isAdmin ? <Settings className="h-5 w-5" /> : <User className="h-5 w-5" />}
                        {isAdmin ? (isRTL ? "لوحة التحكم" : "Dashboard") : (isRTL ? "حسابي" : "My Account")}
                      </Button>
                    </Link>
                    <Button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full justify-start gap-2 h-12 text-base text-destructive hover:bg-destructive/10" variant="ghost">
                      <LogOut className="h-5 w-5" />
                      {t.nav.logout}
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full gap-2 h-12 font-bold text-base" variant="gold">
                      <LogIn className="h-5 w-5" />
                      {t.nav.login}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
