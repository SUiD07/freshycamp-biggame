import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import NextLink from "next/link";
import { Link as LinkIcon } from "lucide-react";
import { PasswordProtectedRoute } from "@/components/mine/PasswordProtectedRoute";

export default async function Home() {
  return (
    <PasswordProtectedRoute>
      {/* <Hero /> */}
      <header className="min-h-screen flex flex-col items-center">
        <div className="flex-1 w-full flex flex-col gap-20 items-center">
          <main className="flex-1 flex flex-col gap-6 px-4">
            <div>
              <NextLink href="/map">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Map</span>
                </div>
              </NextLink>
              <NextLink href="https://freshyc25-biggame.vercel.app/">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>สำรอง</span>
                </div>
              </NextLink>
              <div>--------------------</div>
              <NextLink href="/admin">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Admin</span>
                </div>
              </NextLink>
              <NextLink href="/result">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Result</span>
                </div>
              </NextLink>
              <NextLink href="/snap">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Snap</span>
                </div>
              </NextLink>
              <NextLink href="/emergency">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Emergency</span>
                </div>
              </NextLink>
              <div>--------------------</div>
              <NextLink href="/form/01">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 1</span>
                </div>
              </NextLink>
              <NextLink href="/form/02">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 2</span>
                </div>
              </NextLink>
              <NextLink href="/form/03">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 3</span>
                </div>
              </NextLink>
              <NextLink href="/form/04">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 4</span>
                </div>
              </NextLink>
              <NextLink href="/form/05">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 5</span>
                </div>
              </NextLink>
              <NextLink href="/form/06">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 6</span>
                </div>
              </NextLink>
              <NextLink href="/form/07">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 7</span>
                </div>
              </NextLink>
              <NextLink href="/form/08">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 8</span>
                </div>
              </NextLink>
              <NextLink href="/form/09">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 9</span>
                </div>
              </NextLink>
              <NextLink href="/form/10">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 10</span>
                </div>
              </NextLink>
              <NextLink href="/form/11">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 11</span>
                </div>
              </NextLink>
              <NextLink href="/form/12">
                <div className="flex items-center space-x-2 hover:underline">
                  <LinkIcon size={20} />
                  <span>Form บ้าน 12</span>
                </div>
              </NextLink>
            </div>
            {/* <h2 className="font-medium text-xl mb-4">Next steps</h2> */}
            {/* {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />} */}
          </main>
        </div>
      </header>
    </PasswordProtectedRoute>
  );
}
