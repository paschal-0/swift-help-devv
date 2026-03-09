import { Header } from "./components/Header";
import styles from "./landing.module.css";
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
    <div className={styles.page}>
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CapabilitiesSection />
        <SecuritySection />
        <TestimonialSection />
        <FaqSection />
        <ContactSection />
      </main>
      <FooterSection />
    </div>
  );
}

