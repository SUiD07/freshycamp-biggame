import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import NextLink from "next/link";
import { Link as LinkIcon } from "lucide-react";

export default async function Home() {
  return (
    <>
      {/* <Hero /> */}
      <main className="flex-1 flex flex-col gap-6 px-4">
        <div>
          <NextLink href="https://freshyc25-biggame.vercel.app/">
            <div className="flex items-center space-x-2 hover:underline">
              <LinkIcon size={20} />
              <span>Manual</span>
            </div>
          </NextLink>
          <NextLink href="/map">
            <div className="flex items-center space-x-2 hover:underline">
              <LinkIcon size={20} />
              <span>Map</span>
            </div>
          </NextLink>
        </div>
        {/* <h2 className="font-medium text-xl mb-4">Next steps</h2> */}
        {/* {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />} */}
      </main>
    </>
  );
}
