import { Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { motion } from "framer-motion";

const languages: { code: Language; name: string; flag: string; labelEn: string }[] = [
  { code: "ar", name: "العربية", flag: "🇸🇦", labelEn: "ARABIC PROTOCOL" },
  { code: "en", name: "English", flag: "🇺🇸", labelEn: "ENGLISH INDEX" },
  { code: "fr", name: "Français", flag: "🇫🇷", labelEn: "FRENCH DIALECT" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", labelEn: "GERMAN STANDARDS" },
];

interface LanguageSwitcherProps {
  isTransparent?: boolean;
}

const LanguageSwitcher = ({ isTransparent = false }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-3 uppercase text-[10px] font-black tracking-[0.4em] transition-all duration-500 group ${
            isTransparent 
              ? 'text-white hover:bg-white/10 hover:text-white nav-icon-shadow' 
              : 'text-foreground hover:bg-foreground/5'
          }`}
        >
          <div className="relative">
             <Globe className="h-4 w-4 transition-transform group-hover:rotate-180 duration-1000" />
             <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="hidden sm:inline-flex items-center gap-2">
             {currentLang?.code}
             <span className="text-[8px] opacity-20">//</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-black/90 backdrop-blur-3xl border-white/10 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-500"
      >
        <div className="px-4 py-3 border-b border-white/5 mb-2">
           <div className="text-[9px] uppercase tracking-[0.6em] text-primary/40 font-black">System Locales</div>
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex flex-col items-start gap-1 p-4 rounded-none transition-all duration-500 cursor-pointer
              ${language === lang.code 
                ? "bg-primary/10 border-l-2 border-primary" 
                : "hover:bg-white/5 border-l-2 border-transparent"
              }
            `}
          >
            <div className="flex items-center justify-between w-full">
               <span className="text-xs font-black uppercase tracking-tighter text-white">{lang.name}</span>
               <span className="text-xs opacity-40">{lang.flag}</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-medium">{lang.labelEn}</span>
          </DropdownMenuItem>
        ))}
        <div className="px-4 py-2 mt-2 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-white/10" />
              <span className="text-[8px] uppercase tracking-[0.2em] text-white/10">Verified Interface</span>
           </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
