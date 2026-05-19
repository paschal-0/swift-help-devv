"use client";

type ConsultationLocation = {
  mode?: string | null;
  locationName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type InPersonConsultationMapProps = {
  location: ConsultationLocation;
  compact?: boolean;
};

export function isInPersonConsultation(mode?: string | null) {
  const value = mode?.toLowerCase() ?? "";
  return (
    value.includes("in-person") ||
    value.includes("in person") ||
    value.includes("physical") ||
    value.includes("onsite") ||
    value.includes("on-site")
  );
}

export function formatConsultationAddress(location: ConsultationLocation) {
  return [
    location.locationName,
    location.address,
    location.city,
    location.state,
    location.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function InPersonConsultationMap({
  location,
  compact = false,
}: InPersonConsultationMapProps) {
  if (!isInPersonConsultation(location.mode)) {
    return null;
  }

  const hasCoordinates =
    typeof location.latitude === "number" &&
    typeof location.longitude === "number";
  const address = formatConsultationAddress(location);
  const query = hasCoordinates
    ? `${location.latitude},${location.longitude}`
    : address;

  if (!query) {
    return (
      <div className="rounded-[12px] border border-[#94A3B8] bg-[#F8FAFC] px-3 py-3 text-[12px] leading-4 tracking-[-0.05em] text-[#334155]">
        In-person consultation location has not been provided yet.
      </div>
    );
  }

  const encodedQuery = encodeURIComponent(query);
  const mapUrl = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;

  return (
    <div className="rounded-[14px] border border-[#94A3B8] bg-white p-2">
      <div
        className={`relative overflow-hidden rounded-[10px] bg-[#E2E8F0] ${
          compact ? "h-[150px]" : "h-[190px]"
        }`}
      >
        <iframe
          title="In-person consultation location"
          src={mapUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-[12px] leading-4 tracking-[-0.05em] text-[#334155]">
          {address || query}
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-[10px] bg-[#1565C0] px-3 text-[12px] font-medium leading-4 tracking-[-0.05em] text-[#F8FAFC]"
        >
          Directions
        </a>
      </div>
    </div>
  );
}
