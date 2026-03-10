import { Header } from "./components/Header";
import { CapabilitiesSection } from "./sections/CapabilitiesSection";
import { ContactSection } from "./sections/ContactSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { FooterSection } from "./sections/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FaqSection } from "./sections/FaqSection";
import { SecuritySection } from "./sections/SecuritySection";
import { TestimonialSection } from "./sections/TestimonialSection";

export function LandingPage() {
  return (
    <div className="w-full overflow-x-hidden bg-white text-slate-900">
      <div className="[zoom:0.92] max-[1320px]:[zoom:1]">
        <Header />
        <main>
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <CapabilitiesSection />
          <SecuritySection />
        </main>
      </div>
      <main>
        <TestimonialSection />
        <FaqSection />
      </main>
      <div className="[zoom:0.92] max-[1320px]:[zoom:1]">
        <ContactSection />
        <FooterSection />
      </div>
    </div>
  );
}
