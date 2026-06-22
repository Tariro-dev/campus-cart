import React, { createContext, useContext, useState } from "react";

interface VendorContextValue {
  activeVendorId: number | null;
  setActiveVendorId: (id: number | null) => void;
}

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [activeVendorId, setActiveVendorId] = useState<number | null>(null);

  return (
    <VendorContext.Provider value={{ activeVendorId, setActiveVendorId }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error("useVendor must be used inside VendorProvider");
  return ctx;
}
