import { PublicNavbar } from "@/components/public/PublicNavbar";
import { HeroSection } from "@/components/public/HeroSection";
import { BrandStatement } from "@/components/public/BrandStatement";
import { LoopVisual } from "@/components/public/LoopVisual";
import { BentoGrid } from "@/components/public/BentoGrid";
import { DotTilesSection } from "@/components/public/DotTilesSection";
import { HowItWorks } from "@/components/public/HowItWorks";
import { ClosingCta } from "@/components/public/ClosingCta";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#F5F5F7] selection:bg-aurora-violet/30 selection:text-white">
      {/* 1. Header Navigation */}
      <PublicNavbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Brand Statement Transition */}
      <BrandStatement />

      {/* 4. Institutional Intelligence Loop Visual */}
      <LoopVisual />

      {/* 5. Core Capabilities Asymmetrical Bento Grid */}
      <BentoGrid />

      {/* 6. DotTiles Intelligence Instrument Panel */}
      <DotTilesSection />

      {/* 7. How PRECEDENT Works: Retain -> Recall -> Reflect */}
      <HowItWorks />

      {/* 8. Closing Call to Action */}
      <ClosingCta />

      {/* 9. Minimalist Swiss Footer */}
      <PublicFooter />
    </div>
  );
}
