import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <div className="container relative z-10 text-center space-y-12">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
           className="space-y-6"
        >
           <ShieldAlert className="h-16 w-16 text-primary mx-auto mb-12 opacity-40" />
           <p className="text-[11px] uppercase tracking-[1em] text-white/20 font-black">Electronic_Void_Detected</p>
           <h1 className="text-[12rem] md:text-[20rem] font-black tracking-tighter text-white leading-none select-none opacity-10">404</h1>
           <div className="space-y-4 -mt-12 md:-mt-24">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">Entity Lost</h2>
              <p className="text-white/40 text-[11px] uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed">
                The requested coordinate <span className="text-primary italic">"{location.pathname}"</span> is not registered in the sovereign archive.
              </p>
           </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8 }}
           className="pt-12"
        >
           <Link 
             to="/" 
             className="inline-flex items-center gap-6 px-12 py-6 bg-primary text-black text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white transition-all duration-700 group"
           >
             <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
             Return to Headquarters
           </Link>
        </motion.div>
      </div>

      {/* Decorative Text */}
      <div className="absolute bottom-12 left-12">
          <div className="text-[8px] uppercase tracking-[0.5em] text-white/10 font-black">Institutional Authority // Archive Fail</div>
      </div>
    </div>
  );
};

export default NotFound;
