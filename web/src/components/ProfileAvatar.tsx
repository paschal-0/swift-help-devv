"use client";

type ProfileAvatarProps = {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
};

export function ProfileAvatar({
  src,
  fallbackSrc = "/doctor.jpg",
  alt,
  className = "",
}: ProfileAvatarProps) {
  return (
    <span className={`block overflow-hidden bg-[#E2E8F0] ${className}`}>
      {/* Uploaded avatars are served by the API, so a plain img avoids Next remote-image host coupling. */}
      <img src={src || fallbackSrc} alt={alt} className="h-full w-full object-cover" />
    </span>
  );
}
