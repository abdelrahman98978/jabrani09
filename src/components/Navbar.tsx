import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Car, Phone, User, LogIn, LogOut, Settings, Search } from "lucide-react";
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll detection for transparent navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Determine if navbar should be transparent (at top of homepage)
  const isTransparent = isAtTop && isHomePage;

  return (
    <nav className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
      isTransparent 
        ? 'bg-transparent border-transparent' 
        : 'glass-effect border-b border-border/50'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={siteName}
                className={`h-12 w-12 object-contain rounded-xl ${isTransparent ? 'drop-shadow-lg' : ''}`}
              />
            ) : (
              <img
                src={showroomLogo}
                alt={siteName}
                className={`h-12 w-12 object-contain rounded-xl ${isTransparent ? 'drop-shadow-lg' : ''}`}
              />
            )}
            <div className="hidden sm:block">
              <h1 className={`text-xl font-bold ${isTransparent ? 'text-white drop-shadow-lg' : 'text-gradient-gold'}`}>{siteName}</h1>
              <p className={`text-xs ${isTransparent ? 'text-white/70' : 'text-muted-foreground'}`}>{t.siteSlogan}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href) 
                    ? "text-primary" 
                    : isTransparent 
                      ? "text-white/90 hover:text-white" 
                      : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact Info, Search, Notifications, Cart, Auth & Theme */}
          <div className="hidden lg:flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm ${isTransparent ? 'text-white/80 nav-icon-shadow' : 'text-muted-foreground'}`}>
              <Phone className={`h-4 w-4 ${isTransparent ? 'text-white' : 'text-primary'}`} />
              <span dir="ltr">{settings?.phone || "+966 54 338 9314"}</span>
            </div>
            {/* Global Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className={isTransparent ? 'text-white hover:bg-white/10 nav-icon-shadow' : ''}
            >
              <Search className="h-5 w-5" />
            </Button>
            <NotificationCenter isTransparent={isTransparent} />
            <NotificationSoundToggle className={isTransparent ? 'text-white hover:bg-white/10 nav-icon-shadow' : ''} />
            <CartSheet isTransparent={isTransparent} />
            <ThemeToggle isTransparent={isTransparent} />
            <LanguageSwitcher isTransparent={isTransparent} />
            
            {/* Auth Button/Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.user_metadata?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || (isRTL ? "مستخدم" : "User")}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="h-4 w-4 me-2" />
                    {isRTL ? "الملف الشخصي" : "Profile"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                    <Settings className="h-4 w-4 me-2" />
                    {isRTL ? "لوحة التحكم" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 me-2" />
                    {t.auth.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="gold" size="sm" onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                {t.auth.login}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className={`h-9 w-9 ${isTransparent ? 'text-white hover:bg-white/10 nav-icon-shadow' : ''}`}
            >
              <Search className="h-5 w-5" />
            </Button>
            <NotificationCenter isTransparent={isTransparent} />
            <CartSheet isTransparent={isTransparent} />
            <ThemeToggle isTransparent={isTransparent} />
            <LanguageSwitcher isTransparent={isTransparent} />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user.user_metadata?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || (isRTL ? "مستخدم" : "User")}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="h-4 w-4 me-2" />
                    {isRTL ? "الملف الشخصي" : "Profile"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer">
                    <Settings className="h-4 w-4 me-2" />
                    {isRTL ? "لوحة التحكم" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 me-2" />
                    {t.auth.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/auth")}
                className={isTransparent ? 'text-white hover:bg-white/10 nav-icon-shadow' : ''}
              >
                <LogIn className="h-5 w-5" />
              </Button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${
                isTransparent 
                  ? 'text-white hover:text-white/80 nav-icon-shadow' 
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium transition-colors hover:text-primary ${
                    isActive(link.href) ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">{settings?.phone || "+966 54 338 9314"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Global Search Dialog */}
      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </nav>
  );
};

export default Navbar;
