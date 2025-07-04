import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/components/mine/PasswordProtectedRoute";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Freshy Camp - Big game",
  description: "Big game starter",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center"> */}
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={"/"}>Big Game 2025</Link>
                  {/* <div className="flex items-center gap-2">
                      <DeployButton />
                      </div> */}
                </div>
                {/* {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />} */}
              </div>
            </nav>
            <div className="">{children}</div>

            <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
              <p>
                Powered by Big game core team
                {/* <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                    >
                    Supabase
                    </a> */}
              </p>
              <ThemeSwitcher />
            </footer>
            {/* </div>
          </main> */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
