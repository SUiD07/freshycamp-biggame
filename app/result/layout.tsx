// /app/form/01/layout.tsx
"use client";

import { AutoRefreshProvider } from "@/context/AutoRefreshContext";

export default function Form01Layout({ children }: { children: React.ReactNode }) {
  return <AutoRefreshProvider>{children}</AutoRefreshProvider>;
}