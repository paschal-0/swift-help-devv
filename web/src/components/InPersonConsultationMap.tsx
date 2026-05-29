"use client";

import { useEffect, useState } from "react";

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
  requireInPersonMode?: boolean;
  title?: string;
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
  requireInPersonMode = true,
  title = "In-person consultation location",
}: InPersonConsultationMapProps) {
  const [currentPosition, setCurrentPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
    );
  }, []);

  if (requireInPersonMode && !isInPersonConsultation(location.mode)) {
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
  const distanceKm =
    hasCoordinates && currentPosition
      ? getDistanceKm(currentPosition, {
          latitude: location.latitude as number,
          longitude: location.longitude as number,
        })
      : null;
  const distanceLabel =
    distanceKm === null
      ? null
      : distanceKm >= 10
        ? `${Math.round(distanceKm)} km away`
        : `${distanceKm.toFixed(1)} km away`;

  return (
    <div className="rounded-[14px] border border-[#94A3B8] bg-white p-2">
      <div
        className={`relative overflow-hidden rounded-[10px] bg-[#E2E8F0] ${
          compact ? "h-[150px]" : "h-[190px]"
        }`}
      >
        <iframe
          title={title}
          src={mapUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-[12px] leading-4 tracking-[-0.05em] text-[#334155]">
          {address || query}
          {distanceLabel ? (
            <span className="ml-2 font-medium text-[#1565C0]">{distanceLabel}</span>
          ) : null}
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

function getDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const radiusKm = 6371;
  const fromLat = toRadians(from.latitude);
  const toLat = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const a =
    sinLat * sinLat +
    Math.cos(fromLat) * Math.cos(toLat) * sinLng * sinLng;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
