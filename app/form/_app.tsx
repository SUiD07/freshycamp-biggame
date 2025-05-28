import type { AppProps } from "next/app";
import { AutoRefreshProvider } from "@/context/AutoRefreshContext";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AutoRefreshProvider>
      <Component {...pageProps} />
    </AutoRefreshProvider>
  );
}
