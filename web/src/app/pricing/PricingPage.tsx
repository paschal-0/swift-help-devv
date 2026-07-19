"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Audience = "patients" | "professionals" | "organizations";

type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlights?: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const audienceLabels: Record<Audience, string> = {
  patients: "Patients",
  professionals: "Professionals",
  organizations: "Organizations",
};

const pricingPlans: Record<Audience, PricingPlan[]> = {
  patients: [
    {
      name: "Free Plan",
      price: "GBP 0/month",
      description: "Core access for people who want basic digital healthcare support.",
      features: [
        "Basic AI symptom checker",
        "Browse healthcare professionals",
        "View professional availability",
        "Secure patient account",
      ],
      cta: "Get Started Free",
      href: "/get-started/create-account?role=patient",
    },
    {
      name: "Pay-As-You-Go",
      price: "No subscription",
      description: "Book care only when you need it, with transparent checkout before payment.",
      features: [
        "Professional consultation: professional sets price",
        "Specialist consultation: specialist sets price",
        "Home care services: provider sets price",
      ],
      highlights: ["Pay only when you need care", "Secure payments", "Verified professionals"],
      cta: "Book a Consultation",
      href: "/patient-platform/appointments/book",
      featured: true,
    },
    {
      name: "Premium Plan",
      price: "GBP 9.99/month",
      description: "For patients who want faster access, deeper AI support, and care tracking.",
      features: [
        "Unlimited AI triage",
        "Priority booking access",
        "5% consultation discount",
        "AI voice assistant",
        "Care history and tracking",
        "Smart care recommendations",
      ],
      cta: "Upgrade to Premium",
      href: "/get-started/create-account?role=patient&plan=premium",
    },
  ],
  professionals: [
    {
      name: "Starter",
      price: "GBP 0/month",
      description: "A simple way for verified healthcare professionals to join and earn.",
      features: [
        "Create professional profile",
        "Accept bookings",
        "Basic visibility",
        "Secure payments",
      ],
      highlights: ["15% platform fee applies per booking"],
      cta: "Join as a Professional",
      href: "/get-started/create-account?role=professional",
    },
    {
      name: "Pro Plan",
      price: "GBP 29/month",
      description: "Higher visibility and workflow tools for professionals growing on Swift HELP.",
      features: [
        "Increased visibility in search",
        "Full scheduling tools",
        "Teleconsultation tools",
        "Patient management dashboard",
        "Basic analytics",
        "AI intelligence",
        "AI voice assistant",
      ],
      highlights: ["7.5% platform fee applies per booking"],
      cta: "Upgrade to Pro",
      href: "/get-started/create-account?role=professional&plan=pro",
      featured: true,
    },
  ],
  organizations: [
    {
      name: "Starter",
      price: "GBP 99/month",
      description: "For teams starting with shift posting and basic professional matching.",
      features: [
        "Post shifts",
        "Access professional pool",
        "Basic matching",
        "Up to 3 admin users",
      ],
      cta: "Start Hiring",
      href: "/get-started/create-account?role=organisation&plan=starter",
    },
    {
      name: "Growth",
      price: "GBP 299/month",
      description: "For active care organizations that need stronger staffing operations.",
      features: [
        "Unlimited shift posting",
        "Priority staff matching",
        "Workforce dashboard",
        "Basic analytics",
        "AI operational intelligence assistant",
        "Up to 10 admin users",
      ],
      cta: "Upgrade to Growth",
      href: "/get-started/create-account?role=organisation&plan=growth",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom pricing",
      description: "For multi-location healthcare groups with advanced integration needs.",
      features: [
        "Multi-location support",
        "Advanced analytics",
        "AI workflow support",
        "API integrations",
        "Dedicated account manager",
        "Custom workflows",
        "Admin seats sized to need",
        "Setup and onboarding from GBP 500 to GBP 5,000",
      ],
      cta: "Book a Demo",
      href: "/#contact",
    },
  ],
};

const trustItems = [
  "Secure payments",
  "Verified professionals",
  "Built for healthcare compliance",
  "Scalable for individuals and organizations",
];

const partnerTabs = [
  "Dashboard",
  "Earnings",
  "Referrals",
  "Rewards",
  "Leaderboard",
  "Marketing Tools",
  "Rank Progress",
];

const marketingTools = [
  "Referral link",
  "QR code",
  "Landing page",
  "Social media templates",
  "Flyers",
  "Referral cards",
];

const faqs = [
  {
    question: "How does Swift HELP make money?",
    answer:
      "Swift HELP earns from small transaction commissions and premium subscriptions for advanced patient, professional, and organization features.",
  },
  {
    question: "Do patients need a subscription?",
    answer:
      "No. Patients can pay per consultation or upgrade to Premium for stronger AI support, priority booking, care tracking, and discounts.",
  },
  {
    question: "How are professionals paid?",
    answer:
      "Payments are processed securely. Professionals receive payouts after the applicable platform fee and any payment settlement checks.",
  },
  {
    question: "Are there hidden fees?",
    answer:
      "No. Consultation prices, subscription prices, and platform fees should be shown clearly before checkout.",
  },
];

function CheckMark() {
  return (
    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DFF7EA] text-[13px] font-semibold text-[#087443]">
      +
    </span>
  );
}

function ArrowMark() {
  return <span aria-hidden="true">-&gt;</span>;
}

function PlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={`flex h-full min-w-0 flex-col rounded-[8px] border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)] sm:p-6 ${
        plan.featured ? "border-[#1565C0] ring-2 ring-[#D6ECFF]" : "border-[#DDE6F0]"
      }`}
    >
      {plan.featured ? (
        <span className="mb-4 w-fit rounded-full bg-[#E8F4FF] px-3 py-1 text-[12px] font-semibold uppercase text-[#1565C0]">
          Most relevant
        </span>
      ) : null}
      <div className="min-w-0">
        <h2 className="text-[22px] font-semibold leading-7 text-[#1F2937]">{plan.name}</h2>
        <p className="mt-3 text-[30px] font-semibold leading-10 text-[#0F172A]">{plan.price}</p>
        <p className="mt-3 text-[14px] leading-6 text-[#64748B]">{plan.description}</p>
      </div>

      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <p key={feature} className="flex min-w-0 items-start gap-3 text-[14px] leading-6 text-[#334155]">
            <CheckMark />
            <span className="min-w-0 break-words">{feature}</span>
          </p>
        ))}
      </div>

      {plan.highlights?.length ? (
        <div className="mt-5 space-y-2 rounded-[8px] bg-[#F8FAFC] p-4">
          {plan.highlights.map((highlight) => (
            <p key={highlight} className="text-[13px] font-medium leading-5 text-[#475569]">
              {highlight}
            </p>
          ))}
        </div>
      ) : null}

      <Link
        href={plan.href}
        className={`mt-auto inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[8px] px-4 py-3 text-center text-[14px] font-semibold transition ${
          plan.featured
            ? "bg-[#1565C0] text-white hover:bg-[#0F5B93]"
            : "border border-[#1565C0] bg-white text-[#1565C0] hover:bg-[#E8F4FF]"
        }`}
      >
        {plan.cta}
        <ArrowMark />
      </Link>
    </article>
  );
}

export function PricingPage() {
  const [audience, setAudience] = useState<Audience>("patients");
  const plans = useMemo(() => pricingPlans[audience], [audience]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="border-b border-[#DDE6F0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-w-0 items-center gap-2 text-[22px] font-semibold text-[#1E88E5]">
            <Image src="/jam_medical.png" alt="Swifthelp logo" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="truncate">Swifthelp</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden rounded-[8px] px-4 py-2 text-[14px] font-medium text-[#475569] hover:bg-[#F1F5F9] sm:inline-flex">
              Home
            </Link>
            <Link href="/get-started/login" className="rounded-[8px] bg-[#1565C0] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[#0F5B93]">
              Log in
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-[#DDE6F0] bg-[#EAF6F0]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
          <div className="min-w-0">
            <p className="w-fit rounded-full border border-[#B7E4C7] bg-white px-4 py-2 text-[13px] font-semibold uppercase text-[#087443]">
              Swift HELP subscriptions
            </p>
            <h1 className="mt-6 max-w-4xl text-[42px] font-semibold leading-[1.08] text-[#102A43] sm:text-[58px]">
              Simple, Transparent Pricing for Modern Healthcare Access
            </h1>
            <p className="mt-5 max-w-3xl text-[17px] leading-8 text-[#425466]">
              Whether you are a patient, healthcare professional, or organization, Swift HELP scales with your needs across AI triage, care booking, and healthcare workforce management.
            </p>
          </div>

          <aside className="rounded-[8px] border border-[#CDEBDD] bg-white p-5 shadow-sm">
            <p className="text-[14px] font-semibold text-[#087443]">Revenue model</p>
            <div className="mt-4 space-y-4">
              {[
                ["Subscriptions", "Premium patient, professional, and organization plans."],
                ["Transactions", "Commission on paid bookings and care services."],
                ["Growth", "Partner Network rewards with transparent payout rules."],
              ].map(([label, text]) => (
                <div key={label} className="border-l-4 border-[#20A66A] pl-4">
                  <p className="font-semibold text-[#1F2937]">{label}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#64748B]">{text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[26px] font-semibold text-[#1F2937]">Choose pricing by audience</h2>
            <p className="mt-2 text-[15px] leading-6 text-[#64748B]">
              The page stays clean while showing the right plans for each user type.
            </p>
          </div>
          <div className="grid grid-cols-3 rounded-[8px] border border-[#DDE6F0] bg-white p-1">
            {(Object.keys(audienceLabels) as Audience[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={`min-h-[42px] rounded-[6px] px-3 text-[13px] font-semibold transition sm:px-5 ${
                  audience === key ? "bg-[#1565C0] text-white shadow-sm" : "text-[#475569] hover:bg-[#F1F5F9]"
                }`}
              >
                {audienceLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      <section className="border-y border-[#DDE6F0] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {trustItems.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckMark />
              <p className="text-[14px] font-semibold leading-6 text-[#334155]">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="text-[13px] font-semibold uppercase text-[#B45309]">Growth program</p>
            <h2 className="mt-3 text-[30px] font-semibold leading-10 text-[#1F2937]">Swift HELP Partner Network</h2>
            <p className="mt-4 text-[15px] leading-7 text-[#64748B]">
              A referral and ambassador program can sit inside the platform without being described as network marketing. The important controls are transparent rewards, fraud checks, and payout audit trails.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-[8px] border border-[#F2D9A6] bg-[#FFF8E8] p-5">
              <h3 className="text-[18px] font-semibold text-[#7C4A03]">Placement inside Swift HELP</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Home", "Bookings", "Messages", "Wallet", "Partner Network", "Settings"].map((item) => (
                  <span key={item} className="rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-[#7C4A03]">
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-[8px] border border-[#CDEBDD] bg-[#F0FBF6] p-5">
              <h3 className="text-[18px] font-semibold text-[#087443]">Partner section tabs</h3>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {partnerTabs.map((tab) => (
                  <span key={tab} className="rounded-[6px] bg-white px-3 py-2 text-[13px] font-medium text-[#334155]">
                    {tab}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-[8px] border border-[#DDE6F0] bg-white p-5 lg:col-span-2">
              <h3 className="text-[18px] font-semibold text-[#1F2937]">Marketing toolkit</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {marketingTools.map((tool) => (
                  <div key={tool} className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] font-medium text-[#334155]">
                    {tool}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#102A43]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 text-white sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
          <div>
            <h2 className="text-[30px] font-semibold leading-10">Launch sequence</h2>
            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#CFE3F6]">
              Referral + status + visibility + recurring reward + community creates a long-term acquisition engine when the payout rules are controlled and auditable.
            </p>
          </div>
          <div className="grid gap-3">
            {["Closed beta", "Public referral launch", "Ambassador growth", "Regional partnerships"].map((phase, index) => (
              <div key={phase} className="flex items-center gap-3 rounded-[8px] bg-white/10 px-4 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#20A66A] text-[13px] font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-[14px] font-semibold">{phase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[8px] border border-[#DDE6F0] bg-white p-5">
              <h3 className="text-[17px] font-semibold text-[#1F2937]">{faq.question}</h3>
              <p className="mt-3 text-[14px] leading-6 text-[#64748B]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
