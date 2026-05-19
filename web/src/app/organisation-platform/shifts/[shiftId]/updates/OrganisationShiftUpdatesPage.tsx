"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteOrganizationShiftMessage,
  getOrganizationLiveUrl,
  getOrganizationShift,
  listOrganizationShiftMessages,
  markOrganizationShiftMessagesRead,
  sendOrganizationShiftMessage,
  sendOrganizationShiftTyping,
  updateOrganizationShiftMessage,
  type OrganizationShiftMessage,
  type OrganizationShiftUpdate,
} from "@/services/organizationApi";
import { buildOrganisationShiftDetail } from "../../data";

type UpdatesTab = "All" | "Unread";

type ConversationPreview = {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatarType: "initials" | "photo";
  initials?: string;
  unread?: boolean;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: "organization" | "professional";
  createdAt: string;
  attachments: OrganizationShiftMessage["attachments"];
  editedAt: string | null;
  deletedAt: string | null;
  readByProfessionalAt: string | null;
  deliveredToProfessionalAt: string | null;
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-3" aria-hidden>
      <path
        fill="#334155"
        d="M14.41 6 13 4.59 5.59 12 13 19.41 14.41 18l-6-6 6-6Z"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#F8FAFC"
        d="M3.4 20.6 21 12 3.4 3.4 3.3 10.1 15.8 12 3.3 13.9l.1 6.7Z"
      />
    </svg>
  );
}

function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#1565C0"
        d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.2 22 2 13.8 2 3.7c0-.6.4-1 1-1h4.6c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1l-2.3 2.2Z"
      />
    </svg>
  );
}

function CompletedPill() {
  return (
    <span className="inline-flex h-[23px] items-center justify-center rounded-[6px] border border-[#0D8C24] bg-[#E1FAE5] px-4 text-[12px] font-normal tracking-[-0.05em] text-[#0D8C24]">
      Completed
    </span>
  );
}

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F2FD] text-[18px] font-medium tracking-[-0.05em] text-[#1565C0]">
      {initials}
    </div>
  );
}

function PhotoAvatar() {
  return (
    <div className="h-9 w-9 overflow-hidden rounded-full bg-white">
      <Image src="/doctor.jpg" alt="Doctor avatar" width={36} height={36} className="h-full w-full object-cover" />
    </div>
  );
}

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(Math.round(diffMs / 60000), 1);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  return `${Math.round(diffMinutes / 60)}h`;
}

function updateToPreview(update: OrganizationShiftUpdate): ConversationPreview {
  const text = update.description ?? update.message ?? "";

  return {
    id: update.id,
    name: update.title,
    preview: text,
    time: timeAgo(update.createdAt),
    avatarType: "initials",
    initials: "SH",
    unread: false,
  };
}

function updateToMessage(update: OrganizationShiftUpdate): ChatMessage {
  return {
    id: update.id,
    text: update.description ?? update.message ?? "",
    sender: update.actorUserId ? "organization" : "professional",
    createdAt: update.createdAt,
    attachments: [],
    editedAt: null,
    deletedAt: null,
    readByProfessionalAt: null,
    deliveredToProfessionalAt: null,
  };
}

function messageToChatMessage(message: OrganizationShiftMessage): ChatMessage {
  return {
    id: message.id,
    text: message.deletedAt ? "This message was deleted" : (message.body ?? ""),
    sender: message.senderType === "organization" ? "organization" : "professional",
    createdAt: message.createdAt,
    attachments: message.attachments ?? [],
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    readByProfessionalAt: message.readByProfessionalAt,
    deliveredToProfessionalAt: message.deliveredToProfessionalAt,
  };
}

function messageToPreview(message: OrganizationShiftMessage): ConversationPreview {
  return {
    id: message.id,
    name: message.senderType === "organization" ? "Organization" : "Professional",
    preview: message.deletedAt ? "Message deleted" : (message.body ?? `${message.attachments?.length ?? 0} attachment(s)`),
    time: timeAgo(message.createdAt),
    avatarType: message.senderType === "organization" ? "initials" : "photo",
    initials: "SH",
    unread: message.senderType !== "organization" && !message.readByOrganization,
  };
}

export function OrganisationShiftUpdatesPage({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const detail = buildOrganisationShiftDetail(shiftId);
  const [activeTab, setActiveTab] = useState<UpdatesTab>("All");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachmentDrafts, setAttachmentDrafts] = useState<OrganizationShiftMessage["attachments"]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [professionalTyping, setProfessionalTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const [conversationPreviews, setConversationPreviews] = useState<ConversationPreview[]>([
    {
      id: "c1",
      name: "Shift 2234",
      preview: "I’ll be there in 10 minutes",
      time: "3m",
      avatarType: "initials",
      initials: "SH",
    },
    {
      id: "c2",
      name: "Dr Darah",
      preview: "Hii, i’m actually on my way",
      time: "3m",
      avatarType: "photo",
      unread: true,
    },
    {
      id: "c3",
      name: "Dr Smith",
      preview: "I’ll be there in 10 minutes",
      time: "3m",
      avatarType: "photo",
    },
    {
      id: "c4",
      name: "Dr Patel",
      preview: "Stuck in traffic, expect me in 25 minutes",
      time: "10m",
      avatarType: "photo",
      unread: true,
    },
    {
      id: "c5",
      name: "Dr Johnson",
      preview: "Running a bit late, ETA 15 minutes",
      time: "5m",
      avatarType: "photo",
    },
    {
      id: "c6",
      name: "Dr Lee",
      preview: "On my way, should arrive in 20 minutes",
      time: "7m",
      avatarType: "photo",
    },
    {
      id: "c7",
      name: "Dr Garcia",
      preview: "Just finished up, I'll be there in 12 minutes",
      time: "4m",
      avatarType: "photo",
      unread: true,
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    getOrganizationShift(shiftId)
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (data.messages.length) {
          setConversationPreviews(data.messages.map(messageToPreview));
          setMessages(data.messages.map(messageToChatMessage));
          setHasMoreMessages(data.messages.length >= 50);
          void markOrganizationShiftMessagesRead(shiftId);
          return;
        }

        if (data.updates.length) {
          setConversationPreviews(data.updates.map(updateToPreview));
          setMessages(data.updates.map(updateToMessage));
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load shift updates.");
      });

    return () => {
      isMounted = false;
    };
  }, [shiftId]);

  useEffect(() => {
    const eventSource = new EventSource(getOrganizationLiveUrl(), {
      withCredentials: true,
    });

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as OrganizationShiftMessage;
      if (message.shiftOfferId !== shiftId) {
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.some((item) => item.id === message.id)
          ? currentMessages
          : [...currentMessages, messageToChatMessage(message)],
      );
      setConversationPreviews((currentPreviews) =>
        currentPreviews.some((item) => item.id === message.id)
          ? currentPreviews
          : [messageToPreview(message), ...currentPreviews],
      );
      if (message.senderType === "professional") {
        void markOrganizationShiftMessagesRead(shiftId);
      }
    };

    const handleMutatedMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data) as OrganizationShiftMessage;
      if (message.shiftOfferId !== shiftId) return;
      const mapped = messageToChatMessage(message);
      setMessages((currentMessages) =>
        currentMessages.some((item) => item.id === mapped.id)
          ? currentMessages.map((item) => (item.id === mapped.id ? mapped : item))
          : [...currentMessages, mapped],
      );
    };

    const handleRead = (event: MessageEvent) => {
      const payload = JSON.parse(event.data) as { messageIds?: string[]; readAt?: string };
      if (!payload.messageIds?.length || !payload.readAt) return;
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          payload.messageIds?.includes(message.id)
            ? { ...message, readByProfessionalAt: payload.readAt ?? message.readByProfessionalAt }
            : message,
        ),
      );
    };

    const handleTyping = (event: MessageEvent) => {
      const payload = JSON.parse(event.data) as { shiftOfferId?: string; typing?: boolean };
      if (payload.shiftOfferId !== shiftId) return;
      setProfessionalTyping(Boolean(payload.typing));
      if (payload.typing) {
        window.setTimeout(() => setProfessionalTyping(false), 3000);
      }
    };

    const handleUpdate = (event: MessageEvent) => {
      const update = JSON.parse(event.data) as OrganizationShiftUpdate;
      const updateShiftId = update.shiftOfferId ?? update.shiftId;
      if (updateShiftId !== shiftId) {
        return;
      }

      setConversationPreviews((currentPreviews) =>
        currentPreviews.some((item) => item.id === update.id)
          ? currentPreviews
          : [updateToPreview(update), ...currentPreviews],
      );
    };

    eventSource.addEventListener("organization.shift_message.created", handleMessage);
    eventSource.addEventListener("organization.shift_message.updated", handleMutatedMessage);
    eventSource.addEventListener("organization.shift_message.deleted", handleMutatedMessage);
    eventSource.addEventListener("organization.shift_messages.read", handleRead);
    eventSource.addEventListener("organization.shift_typing", handleTyping);
    eventSource.addEventListener("organization.shift_update.created", handleUpdate);

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("organization.shift_message.created", handleMessage);
      eventSource.removeEventListener("organization.shift_message.updated", handleMutatedMessage);
      eventSource.removeEventListener("organization.shift_message.deleted", handleMutatedMessage);
      eventSource.removeEventListener("organization.shift_messages.read", handleRead);
      eventSource.removeEventListener("organization.shift_typing", handleTyping);
      eventSource.removeEventListener("organization.shift_update.created", handleUpdate);
      eventSource.close();
    };
  }, [shiftId]);

  const visiblePreviews = useMemo(() => {
    return activeTab === "Unread"
      ? conversationPreviews.filter((conversation) => conversation.unread)
      : conversationPreviews;
  }, [activeTab, conversationPreviews]);

  const sendMessage = async () => {
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage && attachmentDrafts.length === 0) return;

    try {
      const message = editingMessageId
        ? await updateOrganizationShiftMessage(shiftId, editingMessageId, {
            body: trimmedMessage,
            attachments: attachmentDrafts,
          })
        : await sendOrganizationShiftMessage(shiftId, {
            body: trimmedMessage,
            attachments: attachmentDrafts,
          });
      setMessages((currentMessages) =>
        currentMessages.some((item) => item.id === message.id)
          ? currentMessages.map((item) => (item.id === message.id ? messageToChatMessage(message) : item))
          : [...currentMessages, messageToChatMessage(message)],
      );
      setConversationPreviews((currentPreviews) =>
        currentPreviews.some((item) => item.id === message.id)
          ? currentPreviews
          : [messageToPreview(message), ...currentPreviews],
      );
      setMessageInput("");
      setAttachmentDrafts([]);
      setEditingMessageId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.");
    }
  };

  const loadOlderMessages = async () => {
    const oldest = messages[0];
    if (!oldest) return;

    try {
      const older = await listOrganizationShiftMessages(shiftId, {
        before: oldest.createdAt,
        limit: 50,
      });
      const normalized = older.map(messageToChatMessage).reverse();
      setMessages((current) => [
        ...normalized.filter((message) => !current.some((item) => item.id === message.id)),
        ...current,
      ]);
      setHasMoreMessages(older.length >= 50);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load older messages.");
    }
  };

  const attachByUrl = () => {
    const url = window.prompt("Paste attachment URL");
    if (!url) return;
    const name = window.prompt("Attachment name") || "Attachment";
    setAttachmentDrafts((current) => [...current, { name, url }]);
  };

  const editMessage = (message: ChatMessage) => {
    if (message.deletedAt) return;
    setEditingMessageId(message.id);
    setMessageInput(message.text);
    setAttachmentDrafts(message.attachments);
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const message = await deleteOrganizationShiftMessage(shiftId, messageId);
      setMessages((current) =>
        current.map((item) => (item.id === message.id ? messageToChatMessage(message) : item)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete message.");
    }
  };

  const handleMessageInputChange = (value: string) => {
    setMessageInput(value);
    void sendOrganizationShiftTyping(shiftId, value.trim().length > 0);
  };

  return (
    <div className="mt-8 xl:mt-[72px]">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push(`/organisation-platform/shifts/${encodeURIComponent(shiftId)}`)}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#334155] transition hover:bg-[#d9e4f2]"
          aria-label="Back to shift detail"
        >
          <BackIcon />
        </button>
        <h1 className="text-[24px] font-semibold tracking-[-0.05em] text-[#334155]">Shift updates</h1>
      </div>

      <section className="mt-6 rounded-[12px] bg-[#F8FAFC] p-5 shadow-[0_10px_28px_rgba(148,163,184,0.08)] xl:p-9">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_268px]">
          <div className="rounded-[12px] border-0">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b-[2px] border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-white">
                  <Image src="/doctor.jpg" alt="Dr Darah avatar" width={40} height={40} className="h-full w-full object-cover" />
                </div>
                <h2 className="text-[18px] font-normal tracking-[-0.05em] text-[#334155] sm:text-[24px]">
                  Dr Darah
                </h2>
                <CompletedPill />
              </div>

              <button
                type="button"
                onClick={() => toast.info("Calling Dr Darah is not available yet.")}
                className="inline-flex h-[37px] w-[37px] cursor-pointer items-center justify-center rounded-full bg-[#E3F2FD]"
                aria-label="Call Dr Darah"
              >
                <CallIcon />
              </button>
            </div>

            <div className="min-h-[360px] space-y-10 px-1 py-8 xl:min-h-[430px]">
              {hasMoreMessages ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={loadOlderMessages}
                    className="rounded-[10px] bg-[#E3F2FD] px-4 py-2 text-[12px] font-medium tracking-[-0.04em] text-[#1565C0]"
                  >
                    Load older messages
                  </button>
                </div>
              ) : null}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "organization" ? "justify-start" : "justify-end"}`}
                >
                  <div className="max-w-[300px]">
                    <div
                      className={`relative rounded-[24px] px-6 py-4 text-[18px] font-light tracking-[-0.05em] ${
                        message.deletedAt
                          ? "bg-[#E2E8F0] text-[#64748B]"
                          : message.sender === "organization"
                            ? "bg-[#1565C0] text-[#F8FAFC]"
                            : "bg-[#E3F2FD] text-[#1E88E5]"
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.attachments.length ? (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <a
                              key={`${message.id}-${attachment.url}`}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-[10px] bg-white/80 px-3 py-2 text-[12px] font-medium text-[#1565C0]"
                            >
                              {attachment.name}
                            </a>
                          ))}
                        </div>
                      ) : null}
                      <span
                        className={`absolute bottom-0 h-5 w-5 ${
                          message.sender === "organization"
                            ? "left-0 -translate-x-1/2 rounded-br-[18px] bg-inherit"
                            : "right-0 translate-x-1/2 rounded-bl-[18px] bg-inherit"
                        }`}
                      />
                    </div>
                    <div className={`mt-2 flex items-center gap-3 text-[11px] text-[#94A3B8] ${message.sender === "organization" ? "justify-start" : "justify-end"}`}>
                      <span>{message.editedAt ? "Edited" : timeAgo(message.createdAt)}</span>
                      {message.sender === "organization" && !message.deletedAt ? (
                        <>
                          <span>{message.readByProfessionalAt ? "Read" : message.deliveredToProfessionalAt ? "Delivered" : "Sent"}</span>
                          <button type="button" onClick={() => editMessage(message)} className="text-[#1565C0]">
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteMessage(message.id)} className="text-[#B42318]">
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {professionalTyping ? (
                <p className="text-[12px] font-light tracking-[-0.04em] text-[#94A3B8]">
                  Professional is typing...
                </p>
              ) : null}
            </div>

            {attachmentDrafts.length ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachmentDrafts.map((attachment) => (
                  <span
                    key={attachment.url}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[#E3F2FD] px-3 py-2 text-[12px] text-[#1565C0]"
                  >
                    {attachment.name}
                    <button
                      type="button"
                      onClick={() =>
                        setAttachmentDrafts((current) =>
                          current.filter((item) => item.url !== attachment.url),
                        )
                      }
                      className="font-semibold"
                    >
                      X
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            {editingMessageId ? (
              <div className="mb-3 flex items-center justify-between rounded-[10px] bg-[#E2E8F0] px-3 py-2 text-[12px] text-[#334155]">
                Editing message
                <button
                  type="button"
                  onClick={() => {
                    setEditingMessageId(null);
                    setMessageInput("");
                    setAttachmentDrafts([]);
                  }}
                  className="font-semibold text-[#1565C0]"
                >
                  Cancel
                </button>
              </div>
            ) : null}
            <div className="rounded-[16px] border border-[#1565C0] bg-[#F8FAFC] p-2">
              <div className="flex items-center gap-3">
                <input
                  value={messageInput}
                  onChange={(event) => handleMessageInputChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Write your message"
                  className="h-[44px] flex-1 border-0 bg-transparent px-3 text-[14px] font-light tracking-[-0.05em] text-[#334155] outline-none placeholder:text-[#94A3B8]"
                />
                <button
                  type="button"
                  onClick={attachByUrl}
                  className="inline-flex h-[45px] cursor-pointer items-center justify-center rounded-[8px] bg-[#E3F2FD] px-3 text-[12px] font-medium text-[#1565C0]"
                >
                  Attach
                </button>
                <button
                  type="button"
                  onClick={sendMessage}
                  className="inline-flex h-[45px] w-[46px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-[#1565C0]"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-[12px] border-2 border-[#E2E8F0] px-3 py-6">
            <div className="border-b-[4px] border-transparent">
              <div className="grid grid-cols-2 items-center pb-3 text-center">
                {(["All", "Unread"] as UpdatesTab[]).map((tab) => {
                  const isActive = tab === activeTab;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative cursor-pointer pb-3 text-[18px] font-medium tracking-[-0.05em] ${
                        isActive ? "text-[#1565C0]" : "text-[#94A3B8]"
                      }`}
                    >
                      {tab}
                      {isActive ? (
                        <span className="absolute bottom-0 left-1/2 h-1 w-[116px] -translate-x-1/2 bg-[#1565C0]" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 space-y-[18px]">
              {visiblePreviews.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => toast.info(`${conversation.name} thread is not switchable yet.`)}
                  className="flex w-full cursor-pointer items-start gap-[9px] text-left"
                >
                  {conversation.avatarType === "initials" && conversation.initials ? (
                    <InitialsAvatar initials={conversation.initials} />
                  ) : (
                    <PhotoAvatar />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[16px] font-medium tracking-[-0.05em] text-[#334155]">
                        {conversation.name}
                      </p>
                      <span className="shrink-0 text-[12px] font-normal tracking-[-0.05em] text-[#94A3B8]">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[14px] leading-[17px] tracking-[-0.05em] text-[#94A3B8]">
                      {conversation.preview}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
