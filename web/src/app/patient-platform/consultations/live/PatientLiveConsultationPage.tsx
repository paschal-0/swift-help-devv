"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ChatTab = "messages" | "summary" | "shared";

type ChatMessage = {
  id: string;
  sender: "provider" | "patient";
  text: string;
};

const messages: ChatMessage[] = [
  { id: "m1", sender: "provider", text: "Hope you get me" },
  { id: "m2", sender: "patient", text: "Yeah i do, but......." },
  { id: "m3", sender: "provider", text: "Hope you get me" },
  { id: "m4", sender: "patient", text: "Yeah i do, but......." },
  { id: "m5", sender: "provider", text: "Hope you get me" },
  { id: "m6", sender: "patient", text: "Yeah i do, but......." },
  { id: "m7", sender: "provider", text: "Hope you get me" },
  { id: "m8", sender: "patient", text: "Yeah i do, but......." },
];

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path fill="#F8FAFC" d="M4 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm15 3 3-2v8l-3-2v-4Z" />
    </svg>
  );
}

function EndCallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M12 14c2.8 0 5.2.8 7 2.3V19h-2v-1.6c-1.3-.9-3.1-1.4-5-1.4s-3.7.5-5 1.4V19H5v-2.7C6.8 14.8 9.2 14 12 14Z"
      />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Zm5 9a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1A7 7 0 0 0 19 12h-2Z"
      />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M3 10v4h4l5 4V6L7 10H3Zm11.5 2a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 14.5 12Zm0-8.5v2.06a8 8 0 0 1 0 12.88v2.06a10 10 0 0 0 0-17Z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M2 21 22 12 2 3v7l12 2-12 2v7Z"
      />
    </svg>
  );
}

export function PatientLiveConsultationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ChatTab>("messages");

  return (
    <article className="mt-[26px] min-h-[664px] rounded-[12px] bg-[#F8FAFC] px-4 pb-6 pt-[17px] md:px-6 xl:px-7">
      <h1 className="text-[24px] font-medium leading-[42px] tracking-[-0.05em] text-[#334155]">
        Live Consultation
      </h1>

      <div className="mt-3 grid grid-cols-1 gap-[15px] xl:grid-cols-[564px_274px]">
        <section className="relative h-[554px] overflow-hidden rounded-[12px] bg-[#94A3B8]">
          <Image
            src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg"
            alt="Consultation stream"
            fill
            className="object-cover"
          />

          <div className="absolute left-[18px] top-[15px] inline-flex items-center gap-[3px] rounded-[12px] bg-[#F8FAFC] p-1">
            <span className="relative h-10 w-10 overflow-hidden rounded-[12px]">
              <Image src="/doctor.jpg" alt="Dr Clara Ken" fill className="object-cover" />
            </span>
            <div className="w-[91px]">
              <p className="text-[10px] font-light leading-4 tracking-[-0.05em] text-[#334155]">General Consultant</p>
              <p className="text-[16px] font-normal leading-4 tracking-[-0.05em] text-[#334155]">Dr Clara Ken</p>
            </div>
          </div>

          <div className="absolute right-[15px] top-[15px] inline-flex h-[46px] w-[109px] items-center justify-center rounded-[70px] bg-[rgba(51,65,85,0.3)]">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F8FAFC]">
                <span className="h-2 w-2 rounded-full bg-[#F20E0E]" />
              </span>
              <span className="text-[16px] font-medium leading-4 tracking-[-0.05em] text-white">03:30</span>
            </div>
          </div>

          <div className="absolute right-[15px] top-[222px] h-[187px] w-[125px] overflow-hidden rounded-[12px] border-2 border-[#F8FAFC] shadow-[0_4px_15px_rgba(0,0,0,0.4)]">
            <Image src="/doctor.jpg" alt="Patient preview" fill className="object-cover" />
          </div>

          <div className="absolute bottom-[23px] left-[17px] right-[17px] flex items-end justify-between">
            <div className="flex h-[144px] w-[51px] flex-col items-center rounded-[32px] bg-[rgba(51,65,85,0.3)] pt-[17px]">
              <div className="relative h-[73px] w-[14px]">
                <span className="absolute left-[5px] top-0 h-[73px] w-[3px] rounded-[12px] bg-[#94A3B8]" />
                <span className="absolute left-[4px] top-[37px] h-[36px] w-[5px] rounded-b-[12px] bg-[#1E88E5]" />
                <span className="absolute left-0 top-[28px] h-[14px] w-[14px] rounded-full bg-[#F8FAFC]" />
              </div>
              <span className="mt-auto mb-[21px] inline-flex h-[18px] w-[18px] items-center justify-center">
                <SpeakerIcon />
              </span>
            </div>

            <div className="flex items-end gap-6">
              <button
                type="button"
                onClick={() => toast.info("Camera toggled")}
                className="inline-flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-[70px] bg-[rgba(255,255,255,0.3)]"
                aria-label="Toggle camera"
              >
                <CameraIcon />
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success("Session ended");
                  router.push("/patient-platform/consultations/rate");
                }}
                className="inline-flex h-20 w-20 cursor-pointer items-center justify-center rounded-[24px] bg-[#C82B33]"
                aria-label="End call"
              >
                <EndCallIcon />
              </button>

              <button
                type="button"
                onClick={() => toast.info("Microphone toggled")}
                className="inline-flex h-[54px] w-[54px] cursor-pointer items-center justify-center rounded-[70px] bg-[rgba(255,255,255,0.3)]"
                aria-label="Toggle microphone"
              >
                <MicrophoneIcon />
              </button>
            </div>
          </div>
        </section>

        <aside className="flex h-[619px] flex-col rounded-[12px] bg-[#E2E8F0] px-[10px] py-[15px]">
          <div className="relative h-[37px] rounded-[12px] bg-[#F8FAFC] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`absolute left-0.5 top-0.5 h-[33px] w-[90px] rounded-[12px] text-[14px] tracking-[-0.05em] ${
                activeTab === "messages" ? "bg-[#1565C0] font-light text-[#F8FAFC]" : "font-normal text-[#94A3B8]"
              }`}
            >
              Messages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("summary")}
              className={`absolute left-[95px] top-0.5 h-[33px] w-[73px] rounded-[12px] text-[14px] tracking-[-0.05em] ${
                activeTab === "summary" ? "bg-[#1565C0] font-light text-[#F8FAFC]" : "font-normal text-[#94A3B8]"
              }`}
            >
              Summary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shared")}
              className={`absolute right-0.5 top-0.5 h-[33px] w-[78px] rounded-[12px] text-[14px] tracking-[-0.05em] ${
                activeTab === "shared" ? "bg-[#1565C0] font-light text-[#F8FAFC]" : "font-normal text-[#94A3B8]"
              }`}
            >
              Shared Info
            </button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto pr-2">
            {activeTab !== "messages" ? (
              <div className="rounded-[12px] bg-[#F8FAFC] p-3 text-[12px] font-normal tracking-[-0.05em] text-[#334155]">
                {activeTab === "summary"
                  ? "Live consultation summary will appear here."
                  : "Shared info from the patient profile will appear here."}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-center gap-[6px] ${
                      message.sender === "provider" ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.sender === "provider" ? (
                      <span className="relative h-6 w-6 overflow-hidden rounded-full">
                        <Image src="/80b7f44a49de7bd948953fbe2f81ec3b8ee42169.jpg" alt="Provider avatar" fill className="object-cover" />
                      </span>
                    ) : null}

                    <span
                      className={`inline-flex h-[29px] items-center rounded-[12px] px-6 text-[12px] font-light leading-4 tracking-[-0.05em] ${
                        message.sender === "provider"
                          ? "bg-[#1565C0] text-[#F8FAFC]"
                          : "bg-[#E3F2FD] text-[#1E88E5]"
                      }`}
                    >
                      {message.text}
                    </span>

                    {message.sender === "patient" ? (
                      <span className="relative h-6 w-6 overflow-hidden rounded-full">
                        <Image src="/doctor.jpg" alt="Patient avatar" fill className="object-cover" />
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 rounded-[12px] bg-[#F8FAFC] p-[7px]">
            <div className="flex items-center justify-between gap-2">
              <span className="pl-1 text-[10px] font-light leading-4 tracking-[-0.05em] text-[#94A3B8]">
                Write your message
              </span>

              <button
                type="button"
                onClick={() => toast.success("Message sent")}
                className="inline-flex h-[33px] w-[34px] cursor-pointer items-center justify-center rounded-[6px] bg-[#1565C0]"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
