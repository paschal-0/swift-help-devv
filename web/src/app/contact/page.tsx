import type { Metadata } from "next";

import { Header } from "../landing/components/Header";
import { FooterSection } from "../landing/sections/FooterSection";
import { ContactSection } from "../landing/sections/ContactSection";

export const metadata: Metadata = {
  title: "Contact | Swift Help",
  description:
    "Contact Swift HELP for patient support, professional onboarding, organization demos, and healthcare platform questions.",
};

export default function ContactRoute() {
  return (
    <div className="w-full overflow-x-hidden bg-white text-slate-900">
      <div className="[zoom:0.92] max-[1320px]:[zoom:1]">
        <Header />
        <main>
          <ContactSection />
        </main>
        <FooterSection />
      </div>
    </div>
  );
}
