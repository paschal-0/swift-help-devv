"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { containerClass } from "../landing/classes";

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
      href: "/contact",
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

function Mark() {
  return (
    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e3f2fd] text-[13px] font-semibold text-[#1565c0]">
      +
    </span>
  );
}

function PlanCard({ plan }: { plan: PricingPlan }) {
  return (
    <article
      className={`flex h-full min-w-0 flex-col rounded-[8px] border bg-white p-6 shadow-[0_18px_55px_rgba(30,136,229,0.10)] transition duration-300 hover:-translate-y-1 max-[767px]:p-5 ${
        plan.featured ? "border-[#1565c0] ring-2 ring-[#d5ecff]" : "border-[#dbeafe]"
      }`}
    >
      {plan.featured ? (
        <span className="mb-5 w-fit rounded-full bg-[#e3f2fd] px-4 py-2 text-[12px] font-semibold uppercase text-[#1565c0]">
          Most relevant
        </span>
      ) : null}
      <h2 className="m-0 text-[24px] font-semibold leading-8 tracking-[-0.05em] text-slate-950 max-[767px]:text-[20px]">
        {plan.name}
      </h2>
      <p className="mt-3 text-[34px] font-semibold leading-10 tracking-[-0.05em] text-[#1565c0] max-[767px]:text-[28px]">
        {plan.price}
      </p>
      <p className="mt-4 min-h-[72px] text-[16px] font-light leading-6 tracking-[-0.05em] text-slate-700 max-[767px]:min-h-0 max-[767px]:text-[14px]">
        {plan.description}
      </p>

      <div className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <p key={feature} className="flex min-w-0 items-start gap-3 text-[15px] leading-6 tracking-[-0.05em] text-slate-800">
            <Mark />
            <span className="min-w-0 break-words">{feature}</span>
          </p>
        ))}
      </div>

      {plan.highlights?.length ? (
        <div className="mt-5 space-y-2 rounded-[8px] bg-[#f4fbff] p-4">
          {plan.highlights.map((highlight) => (
            <p key={highlight} className="text-[14px] font-medium leading-5 tracking-[-0.05em] text-slate-700">
              {highlight}
            </p>
          ))}
        </div>
      ) : null}

      <Link
        href={plan.href}
        className={`mt-auto inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[45px] px-5 py-3 text-center text-[18px] font-normal tracking-[-0.05em] transition max-[767px]:text-[16px] ${
          plan.featured
            ? "bg-[linear-gradient(180deg,#1e88e5_0%,#114b7f_72.12%)] text-[#e3f2fd] hover:brightness-110"
            : "border border-[#1565c0] bg-white text-[#1565c0] hover:bg-[#e3f2fd]"
        }`}
      >
        {plan.cta}
        <span aria-hidden="true">-&gt;</span>
      </Link>
    </article>
  );
}

export function PricingPage() {
  const [audience, setAudience] = useState<Audience>("patients");
  const plans = useMemo(() => pricingPlans[audience], [audience]);

  return (
    <main className="bg-white text-slate-900">
      <section className="bg-[#e3f2fd] pb-[90px] pt-[35px] max-[767px]:pb-14 max-[767px]:pt-5">
        <div className={containerClass}>
          <div className="grid items-center gap-10 px-6 max-[767px]:px-2 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0">
              <p className="m-0 text-[24px] font-light leading-7 tracking-[-0.05em] text-[#1e1e1e] max-[767px]:text-[16px] max-[767px]:leading-5">
                Swift HELP Pricing
              </p>
              <h1 className="m-0 mt-5 max-w-[830px] text-[56px] font-semibold leading-[60px] tracking-[-0.05em] text-[#1e1e1e] max-[767px]:mt-3 max-[767px]:text-[34px] max-[767px]:leading-9">
                Simple, Transparent Pricing for Modern Healthcare Access
              </h1>
              <p className="mt-6 max-w-[760px] text-[24px] font-light leading-8 tracking-[-0.05em] text-[#1e1e1e] max-[767px]:mt-4 max-[767px]:text-[16px] max-[767px]:leading-6">
                Whether you are a patient, healthcare professional, or organization,
                Swift HELP scales with your needs.
              </p>
            </div>

            <aside className="rounded-[8px] border border-white/80 bg-white p-6 shadow-[0_18px_55px_rgba(30,136,229,0.13)]">
              <p className="text-[18px] font-semibold leading-6 tracking-[-0.05em] text-[#1565c0]">
                Multi-revenue platform
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["Subscriptions", "Premium plans for patients, professionals, and organizations."],
                  ["Transactions", "Platform fees on consultations, services, and shift bookings."],
                  ["Partner Network", "Referral growth with transparent reward and payout rules."],
                ].map(([label, text]) => (
                  <div key={label} className="border-l-4 border-[#1e88e5] pl-4">
                    <p className="font-semibold tracking-[-0.05em] text-slate-950">{label}</p>
                    <p className="mt-1 text-[14px] leading-5 tracking-[-0.05em] text-slate-700">{text}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-[72px] max-[767px]:py-12">
        <div className={containerClass}>
          <div className="flex items-end justify-between gap-6 px-6 max-[900px]:flex-col max-[900px]:items-start max-[767px]:px-2">
            <div>
              <h2 className="m-0 text-[42px] font-semibold leading-[46px] tracking-[-0.05em] text-black max-[767px]:text-[30px] max-[767px]:leading-9">
                Choose your access
              </h2>
              <p className="mt-3 max-w-[560px] text-[21px] font-light leading-7 tracking-[-0.05em] text-[#1e1e1e] max-[767px]:text-[15px] max-[767px]:leading-6">
                Use the toggle to keep patient, professional, and organization
                pricing clear.
              </p>
            </div>
            <div className="grid w-full max-w-[560px] grid-cols-3 rounded-[45px] border border-[#dbeafe] bg-white p-1 shadow-[0_10px_35px_rgba(30,136,229,0.10)] max-[767px]:max-w-none">
              {(Object.keys(audienceLabels) as Audience[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAudience(key)}
                  className={`min-h-[52px] rounded-[45px] px-4 text-[17px] font-normal tracking-[-0.05em] transition max-[767px]:min-h-[44px] max-[767px]:px-2 max-[767px]:text-[13px] ${
                    audience === key
                      ? "bg-[#334155] text-white shadow-sm"
                      : "text-slate-700 hover:bg-[#e3f2fd]"
                  }`}
                >
                  {audienceLabels[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid items-stretch gap-6 px-6 max-[767px]:px-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4fbff] py-12">
        <div className={containerClass}>
          <div className="grid gap-5 px-6 max-[767px]:px-2 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[8px] bg-white p-5 shadow-[0_12px_35px_rgba(30,136,229,0.08)]">
                <Mark />
                <p className="text-[16px] font-semibold leading-6 tracking-[-0.05em] text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[78px] max-[767px]:py-12">
        <div className={containerClass}>
          <div className="grid gap-9 px-6 max-[767px]:px-2 lg:grid-cols-[380px_minmax(0,1fr)]">
            <div>
              <p className="text-[20px] font-light leading-7 tracking-[-0.05em] text-[#1565c0]">
                Investor-friendly growth
              </p>
              <h2 className="mt-3 text-[42px] font-semibold leading-[46px] tracking-[-0.05em] text-black max-[767px]:text-[30px] max-[767px]:leading-9">
                Swift HELP Partner Network
              </h2>
              <p className="mt-5 text-[20px] font-light leading-7 tracking-[-0.05em] text-[#1e1e1e] max-[767px]:text-[15px] max-[767px]:leading-6">
                Use referral marketing, ambassador contracts, transparent payouts,
                and fraud scoring so the program is measurable and auditable.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-[8px] border border-[#dbeafe] bg-white p-5 shadow-sm">
                <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.05em] text-slate-950">
                  Platform placement
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Home", "Bookings", "Messages", "Wallet", "Partner Network", "Settings"].map((item) => (
                    <span key={item} className="rounded-full bg-[#e3f2fd] px-3 py-2 text-[14px] font-medium tracking-[-0.05em] text-[#1565c0]">
                      {item}
                    </span>
                  ))}
                </div>
              </article>

              <article className="rounded-[8px] border border-[#dbeafe] bg-white p-5 shadow-sm">
                <h3 className="text-[24px] font-semibold leading-8 tracking-[-0.05em] text-slate-950">
                  Partner section tabs
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {partnerTabs.map((tab) => (
                    <span key={tab} className="rounded-[8px] bg-[#f4fbff] px-3 py-2 text-[14px] font-medium tracking-[-0.05em] text-slate-700">
                      {tab}
                    </span>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e3f2fd] py-[72px] max-[767px]:py-12">
        <div className={containerClass}>
          <div className="grid gap-5 px-6 max-[767px]:px-2 lg:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-[8px] bg-white p-6 shadow-[0_12px_35px_rgba(30,136,229,0.10)]">
                <h3 className="text-[22px] font-semibold leading-8 tracking-[-0.05em] text-slate-950">
                  {faq.question}
                </h3>
                <p className="mt-3 text-[16px] font-light leading-6 tracking-[-0.05em] text-slate-700">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
