import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Download,
  Eye,
  FileSearch,
  Zap,
  ShieldCheck,
  Building2,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/TenantContext";

const ManifestsManagement = () => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: manifests, isLoading } = useQuery({
    queryKey: ["admin-manifests", tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data, error } = await supabase
        .from("manifests")
        .select(`
          *,
          order:orders!inner(
            order_number,
            total_amount,
            tenant_id,
            customer:customers(name, phone),
            car:cars(name, name_ar)
          )
        `)
        .eq("order.tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!tenant) throw new Error("No tenant active");
      const { error } = await supabase
        .from("manifests")
        .update({ status: 'verified' })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-manifests"] });
      toast({
        title: isRTL ? "تم التحقق" : "Manifest Verified",
        description: isRTL ? "تم اعتماد المانيفستو في السجل السيادي" : "Manifest has been authorized in the sovereign ledger",
      });
    },
  });

  const filteredManifests = manifests?.filter(m => {
    const matchesSearch = m.manifest_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return { 
          label: isRTL ? "معتمد" : "Verified", 
          icon: ShieldCheck, 
          class: "bg-green-500/10 text-green-500 border-green-500/20" 
        };
      case "pending":
        return { 
          label: isRTL ? "قيد التدقيق" : "Pending", 
          icon: Clock, 
          class: "bg-amber-500/10 text-amber-500 border-amber-500/20" 
        };
      case "draft":
        return { 
          label: isRTL ? "مسودة" : "Draft", 
          icon: FileSearch, 
          class: "bg-blue-500/10 text-blue-500 border-blue-500/20" 
        };
      default:
        return { 
          label: status, 
          icon: AlertCircle, 
          class: "bg-muted text-muted-foreground" 
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-4">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Building2 className="h-12 w-12 text-primary/40" />
        </motion.div>
        <p className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
          Accessing Sovereign Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-black/40 min-h-[600px] border border-white/5 rounded-[24px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-primary" />
             </div>
             <h2 className="text-2xl font-black tracking-tight uppercase">
               {isRTL ? "المانيفستو السيادي" : "Sovereign Manifests"}
             </h2>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Institutional Logistics & Asset Archival Protocol
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={isRTL ? "البحث برقم المانيفستو..." : "Search manifests..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-black/40 border-white/10 rounded-xl text-[11px] uppercase tracking-widest focus:ring-primary/20"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-white/10 bg-black/40">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 text-white">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("verified")}>Verified</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Manifest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredManifests?.map((manifest, idx) => {
            const statusConfig = getStatusConfig(manifest.status);
            return (
              <motion.div
                key={manifest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-[#0C0F14] border border-white/5 p-6 rounded-[24px] hover:border-primary/30 transition-all duration-500 overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                   <Package className="h-24 w-24 -rotate-12" />
                </div>

                <div className="flex flex-col h-full space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-[0.4em] text-primary font-black">Archive Sequence</p>
                      <h3 className="text-lg font-black tracking-tighter text-white">
                        {manifest.manifest_number}
                      </h3>
                    </div>
                    <Badge className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest border ${statusConfig.class}`}>
                       <statusConfig.icon className="h-3 w-3 mr-1 inline" />
                       {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
                       <div className="flex items-center gap-3">
                          <Zap className="h-3 w-3 text-primary" />
                          <span className="text-[10px] uppercase tracking-widest text-white/60">
                            {isRTL ? manifest.order?.car?.name_ar : manifest.order?.car?.name}
                          </span>
                       </div>
                       <div className="flex items-center gap-3">
                          <Truck className="h-3 w-3 text-primary/40" />
                          <span className="text-[10px] uppercase tracking-widest text-white/40">
                             Logistics Status: Active
                          </span>
                       </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest px-1">
                       <span className="text-white/20">Valuation</span>
                       <span className="text-primary font-black">
                         {Number(manifest.order?.total_amount).toLocaleString()} SDG
                       </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                      onClick={() => {}}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Ledger
                    </Button>
                    {manifest.status !== 'verified' && (
                      <Button 
                        className="flex-1 h-12 bg-primary hover:bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                        onClick={() => verifyMutation.mutate(manifest.id)}
                        disabled={verifyMutation.isPending}
                      >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Authorize
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredManifests?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
           <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
              <Package className="h-8 w-8 text-white/10" />
           </div>
           <p className="text-[11px] uppercase tracking-[0.4em] text-white/20">
             No sovereign manifests found in archive.
           </p>
        </div>
      )}
    </div>
  );
};

export default ManifestsManagement;
