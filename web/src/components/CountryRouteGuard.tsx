"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const COUNTRY_COOKIE = "swifthelp_country";
const COUNTRY_SOURCE_COOKIE = "swifthelp_country_source";
const DEFAULT_COUNTRY = "ng";

const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  "Africa/Accra": "gh",
  "Africa/Cairo": "eg",
  "Africa/Casablanca": "ma",
  "Africa/Johannesburg": "za",
  "Africa/Kampala": "ug",
  "Africa/Kigali": "rw",
  "Africa/Lagos": "ng",
  "Africa/Nairobi": "ke",
  "Africa/Tunis": "tn",
  "America/Argentina/Buenos_Aires": "ar",
  "America/Bogota": "co",
  "America/Chicago": "us",
  "America/Denver": "us",
  "America/Los_Angeles": "us",
  "America/Mexico_City": "mx",
  "America/New_York": "us",
  "America/Phoenix": "us",
  "America/Sao_Paulo": "br",
  "America/Toronto": "ca",
  "Asia/Bangkok": "th",
  "Asia/Dhaka": "bd",
  "Asia/Dubai": "ae",
  "Asia/Hong_Kong": "hk",
  "Asia/Jakarta": "id",
  "Asia/Jerusalem": "il",
  "Asia/Karachi": "pk",
  "Asia/Kolkata": "in",
  "Asia/Kuala_Lumpur": "my",
  "Asia/Manila": "ph",
  "Asia/Qatar": "qa",
  "Asia/Riyadh": "sa",
  "Asia/Seoul": "kr",
  "Asia/Shanghai": "cn",
  "Asia/Singapore": "sg",
  "Asia/Tokyo": "jp",
  "Asia/Yerevan": "am",
  "Australia/Adelaide": "au",
  "Australia/Brisbane": "au",
  "Australia/Melbourne": "au",
  "Australia/Perth": "au",
  "Australia/Sydney": "au",
  "Europe/Amsterdam": "nl",
  "Europe/Berlin": "de",
  "Europe/Brussels": "be",
  "Europe/Dublin": "ie",
  "Europe/Lisbon": "pt",
  "Europe/London": "uk",
  "Europe/Madrid": "es",
  "Europe/Oslo": "no",
  "Europe/Paris": "fr",
  "Europe/Rome": "it",
  "Europe/Stockholm": "se",
  "Europe/Vienna": "at",
  "Europe/Warsaw": "pl",
  "Pacific/Auckland": "nz",
};

export function CountryRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const visiblePathname = window.location.pathname;
    const countryFromPath = getCountryFromPath(visiblePathname);

    if (countryFromPath) {
      const source = getCookie(COUNTRY_SOURCE_COOKIE);
      const browserCountry = getBrowserCountry();

      if (
        source === "auto" &&
        browserCountry &&
        browserCountry !== countryFromPath
      ) {
        const correctedPathname = replaceCountryInPath(
          visiblePathname,
          browserCountry,
        );
        const correctedUrl = `${correctedPathname}${window.location.search}${window.location.hash}`;

        setCountryCookies(browserCountry, "explicit");
        router.replace(correctedUrl);
        return;
      }

      setCountryCookies(countryFromPath, "explicit");
      return;
    }

    const country = getStoredCountry() ?? getBrowserCountry() ?? DEFAULT_COUNTRY;
    const nextPath =
      visiblePathname === "/" ? `/${country}` : `/${country}${visiblePathname}`;
    const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;

    router.replace(nextUrl);
  }, [pathname, router]);

  return null;
}

function getCountryFromPath(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (!firstSegment) {
    return null;
  }

  const country = firstSegment.toLowerCase();
  return /^[a-z]{2}$/.test(country) ? normalizeCountryCode(country) : null;
}

function getStoredCountry() {
  return normalizeCountryCode(getCookie(COUNTRY_COOKIE));
}

function getBrowserCountry() {
  const timezoneCountry = getCountryFromTimezone();

  if (timezoneCountry) {
    return timezoneCountry;
  }

  for (const language of navigator.languages ?? [navigator.language]) {
    const region = language.match(/^[a-z]{2,3}-([a-z]{2})$/i)?.[1];
    const country = normalizeCountryCode(region);

    if (country) {
      return country;
    }
  }

  return null;
}

function getCountryFromTimezone() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeCountryCode(TIMEZONE_COUNTRY_MAP[timezone]);
}

function getCookie(name: string) {
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCountryCookies(country: string, source: "auto" | "explicit") {
  document.cookie = `${COUNTRY_COOKIE}=${country}; max-age=${60 * 60 * 24 * 180}; path=/; samesite=lax`;
  document.cookie = `${COUNTRY_SOURCE_COOKIE}=${source}; max-age=${60 * 60 * 24 * 180}; path=/; samesite=lax`;
}

function replaceCountryInPath(pathname: string, country: string) {
  const segments = pathname.split("/").filter(Boolean);
  segments[0] = country;
  return `/${segments.join("/")}`;
}

function normalizeCountryCode(value?: string | null) {
  if (!value) {
    return null;
  }

  const country = decodeURIComponent(value).trim().toLowerCase();
  return country === "gb" ? "uk" : country;
}
