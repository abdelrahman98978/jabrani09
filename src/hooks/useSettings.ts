import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export const useSettings = () => {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ["site-settings", tenant?.id],
    queryFn: async () => {
      if (!tenant) return null;
      
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching settings:", error);
        return null;
      }
      return data;
    },
    enabled: !!tenant,
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
};
