import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyWait } from "@/components/sections/WhyWait";
import { BehindTheScenes } from "@/components/sections/BehindTheScenes";
import { WeeklyDrop } from "@/components/sections/WeeklyDrop";
import { InstagramTeaser } from "@/components/sections/InstagramTeaser";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col overflow-x-hidden">
      <Hero />
      <WeeklyDrop />
      <BehindTheScenes />
      <WhyWait />
      <HowItWorks />
      <InstagramTeaser />
      <Footer />
    </main>
  );
}
