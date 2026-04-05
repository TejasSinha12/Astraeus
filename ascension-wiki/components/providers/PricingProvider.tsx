"use client";
import React, { createContext, useContext } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PricingContextType {
    surgeMultiplier: number;
    baseCost: number;
    isLoading: boolean;
}

const PricingContext = createContext<PricingContextType>({ surgeMultiplier: 1.0, baseCost: 10.0, isLoading: true });

export function PricingProvider({ children }: { children: React.ReactNode }) {
    const { data, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_PLATFORM_API_URL}/economy/pricing/current`, fetcher, { refreshInterval: 15000 });
    
    return (
        <PricingContext.Provider value={{
            surgeMultiplier: data?.surge_multiplier || 1.0,
            baseCost: data?.base_cost || 10.0,
            isLoading: isLoading
        }}>
            {children}
        </PricingContext.Provider>
    );
}

export const usePricing = () => useContext(PricingContext);
