import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background"
import Link from "next/link"
const Index = () => (
  <AuroraBackground>
    <div className="relative flex flex-col gap-4 items-center justify-center px-4">
      <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
        Apartment Management System
      </div>
      <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
        Intro to SE - SE02
      </div>
      <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
        <Link href="/login">Sign In</Link>
      </button>
    </div>
  </AuroraBackground>
)
export default Index