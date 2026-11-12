import { Hero } from "@/components/landing/Hero";
import { TrackShowcase } from "@/components/landing/TrackShowcase";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { BlockchainSection } from "@/components/landing/BlockchainSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <TrackShowcase />
      <Features />
      <HowItWorks />
      <SecuritySection />
      <BlockchainSection />
    </div>
  );
}
