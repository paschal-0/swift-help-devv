"use client";

import Image from "next/image";

type ProfileAvatarProps = {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
};

export function ProfileAvatar({
  src,
  fallbackSrc,
  alt,
  className = "",
}: ProfileAvatarProps) {
  const imageSrc = src || fallbackSrc;

  return (
    <span className={`relative block overflow-hidden bg-[#E2E8F0] ${className}`}>
      {imageSrc ? (
        <Image src={imageSrc} alt={alt} fill sizes="64px" className="object-cover" unoptimized />
      ) : (
        <span className="flex h-full w-full items-center justify-center" aria-label={alt}>
          <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-[#94A3B8]" aria-hidden>
            <path
              fill="currentColor"
              d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.67-8 5v2h16v-2c0-2.33-2.67-5-8-5Z"
            />
          </svg>
        </span>
      )}
    </span>
  );
}
