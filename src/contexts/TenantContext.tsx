import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  plan_tier: 'basic' | 'pro' | 'sovereign';
  branding: any;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const hostname = window.location.hostname;
        let query = supabase.from('tenants').select('*');

        // Logic to determine tenant from hostname
        if (hostname.includes('localhost') || hostname.includes('stackblitz') || hostname.includes('lovable')) {
          // For development, we can use a query param or default to jabrani
          const urlParams = new URLSearchParams(window.location.search);
          const forcedSlug = urlParams.get('tenant') || 'jabrani';
          query = query.eq('slug', forcedSlug);
        } else {
          // In production, check custom_domain or subdomain
          // This is a simplified check
          query = query.or(`custom_domain.eq.${hostname},slug.eq.${hostname.split('.')[0]}`);
        }

        const { data, error: supabaseError } = await query.single();

        if (supabaseError) throw supabaseError;
        setTenant(data as Tenant);
      } catch (err: any) {
        console.error('Error loading tenant context:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
