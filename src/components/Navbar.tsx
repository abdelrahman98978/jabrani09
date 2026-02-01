import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Car, Phone, User, LogIn, LogOut, Settings, Search, Sparkles } from "lucide-react";
import showroomLogo from "@/assets/al-jabrani-logo.jpg";
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
  const [isAtTop, setIsAtTop] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: settings } = useSettings();
  const isRTL = language === "ar";
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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

  const isTransparent = isAtTop && isHomePage;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${isTransparent
        ? 'bg-transparent border-transparent py-6'
        : 'bg-background/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group relative">
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src={showroomLogo}
                alt={siteName}
                className={`h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover shadow-2xl transition-all duration-500 ${isTransparent ? 'scale-110' : 'scale-100'}`}
              />
            </div>
            <div className={`ms-3 flex flex-col transition-all duration-500 ${isTransparent ? 'translate-x-1' : 'translate-x-0'}`}>
              <span className={`text-lg md:text-xl font-black leading-none tracking-tight ${isTransparent ? 'text-white' : 'text-foreground'}`}>
                {siteName}
                <Sparkles className="inline-block h-3 w-3 ms-1 text-primary animate-pulse" />
              </span>
              <span className={`text-[10px] uppercase tracking-[0.3em] font-bold ${isTransparent ? 'text-white/60' : 'text-muted-foreground'}`}>
                Premium Motors
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest transition-all relative group ${isActive(link.href)
                  ? isTransparent ? 'text-white' : 'text-primary'
                  : isTransparent ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-active"
                    className={`absolute inset-0 rounded-full -z-10 ${isTransparent ? 'bg-white/10' : 'bg-primary/5'}`}
                  />
                )}
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4 ${isActive(link.href) ? 'w-4' : 'w-0'}`} />
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <GlobalSearch />
              <NotificationCenter />
              <ThemeToggle />
              <LanguageSwitcher />

              {/* Account Check */}
              {user ? (
                <Link to={isAdmin ? "/admin" : "/profile"}>
                  <Button variant="ghost" size="icon" className="group rounded-full hover:bg-primary/10">
                    <User className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="group rounded-full hover:bg-primary/10">
                    <User className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
              )}

              {/* Account / Dashboard Button */}
              {user ? (
                <Link to={isAdmin ? "/admin" : "/profile"}>
                  <Button variant="ghost" size="icon" className="group relative rounded-full hover:bg-primary/10">
                    <User className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                    <span className="sr-only">{isAdmin ? "Admin" : "Profile"}</span>
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="group rounded-full hover:bg-primary/10">
                    <User className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
              )}
            </div>

            <CartSheet />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/50 p-0 transition-all">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.user_metadata.avatar_url} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                        {getInitials(user.user_metadata.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl bg-card/95 backdrop-blur-xl border-border/50">
                  <div className="p-4 border-b border-border/50">
                    <p className="text-sm font-black truncate">{user.user_metadata.full_name || user.email}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="py-3 px-4 rounded-xl cursor-pointer">
                    <Settings className="me-2 h-4 w-4" />
                    <span>{isRTL ? "لوحة التحكم" : "Dashboard"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="py-3 px-4 rounded-xl cursor-pointer text-destructive focus:bg-destructive/10">
                    <LogOut className="me-2 h-4 w-4" />
                    <span>{t.nav.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  variant={isTransparent ? "outline" : "gold"}
                  className={`rounded-full px-6 font-black uppercase tracking-tighter ${isTransparent ? 'border-white/30 text-white hover:bg-white hover:text-black' : 'shadow-lg shadow-primary/20'}`}
                >
                  <LogIn className="h-4 w-4 me-2" />
                  {t.nav.login}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
