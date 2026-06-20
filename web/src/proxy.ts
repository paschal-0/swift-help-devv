import { NextResponse, type NextRequest } from "next/server";

const COUNTRY_COOKIE = "swifthelp_country";
const COUNTRY_SOURCE_COOKIE = "swifthelp_country_source";
const DEFAULT_COUNTRY = "ng";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000";
const MAINTENANCE_CACHE_TTL_MS = 10_000;
const MAINTENANCE_BLOCKED_PREFIXES = [
  "/patient-platform",
  "/professional-platform",
  "/organisation-platform",
  "/organization-platform",
  "/patient/onboarding",
  "/professional/onboarding",
  "/organisation/onboarding",
  "/organization/onboarding",
  "/communication",
];

let maintenanceCache:
  | {
      enabled: boolean;
      expiresAt: number;
    }
  | undefined;

const SUPPORTED_COUNTRY_CODES = new Set(
  [
    "ad",
    "ae",
    "af",
    "ag",
    "ai",
    "al",
    "am",
    "ao",
    "aq",
    "ar",
    "as",
    "at",
    "au",
    "aw",
    "ax",
    "az",
    "ba",
    "bb",
    "bd",
    "be",
    "bf",
    "bg",
    "bh",
    "bi",
    "bj",
    "bl",
    "bm",
    "bn",
    "bo",
    "bq",
    "br",
    "bs",
    "bt",
    "bv",
    "bw",
    "by",
    "bz",
    "ca",
    "cc",
    "cd",
    "cf",
    "cg",
    "ch",
    "ci",
    "ck",
    "cl",
    "cm",
    "cn",
    "co",
    "cr",
    "cu",
    "cv",
    "cw",
    "cx",
    "cy",
    "cz",
    "de",
    "dj",
    "dk",
    "dm",
    "do",
    "dz",
    "ec",
    "ee",
    "eg",
    "eh",
    "er",
    "es",
    "et",
    "fi",
    "fj",
    "fk",
    "fm",
    "fo",
    "fr",
    "ga",
    "gb",
    "gd",
    "ge",
    "gf",
    "gg",
    "gh",
    "gi",
    "gl",
    "gm",
    "gn",
    "gp",
    "gq",
    "gr",
    "gs",
    "gt",
    "gu",
    "gw",
    "gy",
    "hk",
    "hm",
    "hn",
    "hr",
    "ht",
    "hu",
    "id",
    "ie",
    "il",
    "im",
    "in",
    "io",
    "iq",
    "ir",
    "is",
    "it",
    "je",
    "jm",
    "jo",
    "jp",
    "ke",
    "kg",
    "kh",
    "ki",
    "km",
    "kn",
    "kp",
    "kr",
    "kw",
    "ky",
    "kz",
    "la",
    "lb",
    "lc",
    "li",
    "lk",
    "lr",
    "ls",
    "lt",
    "lu",
    "lv",
    "ly",
    "ma",
    "mc",
    "md",
    "me",
    "mf",
    "mg",
    "mh",
    "mk",
    "ml",
    "mm",
    "mn",
    "mo",
    "mp",
    "mq",
    "mr",
    "ms",
    "mt",
    "mu",
    "mv",
    "mw",
    "mx",
    "my",
    "mz",
    "na",
    "nc",
    "ne",
    "nf",
    "ng",
    "ni",
    "nl",
    "no",
    "np",
    "nr",
    "nu",
    "nz",
    "om",
    "pa",
    "pe",
    "pf",
    "pg",
    "ph",
    "pk",
    "pl",
    "pm",
    "pn",
    "pr",
    "ps",
    "pt",
    "pw",
    "py",
    "qa",
    "re",
    "ro",
    "rs",
    "ru",
    "rw",
    "sa",
    "sb",
    "sc",
    "sd",
    "se",
    "sg",
    "sh",
    "si",
    "sj",
    "sk",
    "sl",
    "sm",
    "sn",
    "so",
    "sr",
    "ss",
    "st",
    "sv",
    "sx",
    "sy",
    "sz",
    "tc",
    "td",
    "tf",
    "tg",
    "th",
    "tj",
    "tk",
    "tl",
    "tm",
    "tn",
    "to",
    "tr",
    "tt",
    "tv",
    "tw",
    "tz",
    "ua",
    "ug",
    "uk",
    "um",
    "us",
    "uy",
    "uz",
    "va",
    "vc",
    "ve",
    "vg",
    "vi",
    "vn",
    "vu",
    "wf",
    "ws",
    "ye",
    "yt",
    "za",
    "zm",
    "zw",
  ],
);

const GEO_HEADER_NAMES = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
  "x-geo-country",
  "x-appengine-country",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const countryFromPath = getCountryFromPath(pathname);

  if (countryFromPath) {
    const strippedPath = stripCountryFromPath(pathname);

    if (
      shouldBlockForMaintenance(strippedPath) &&
      (await isMaintenanceModeEnabled())
    ) {
      const maintenanceUrl = request.nextUrl.clone();
      maintenanceUrl.pathname = "/maintenance";
      maintenanceUrl.search = "";

      const response = NextResponse.rewrite(maintenanceUrl);
      response.cookies.set(COUNTRY_COOKIE, countryFromPath, {
        maxAge: 60 * 60 * 24 * 180,
        path: "/",
        sameSite: "lax",
      });
      response.headers.set("x-swifthelp-country", countryFromPath);
      response.headers.set("x-swifthelp-maintenance", "1");
      return response;
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath;
    const storedCountry = normalizeCountryCode(
      request.cookies.get(COUNTRY_COOKIE)?.value,
    );
    const storedSource = request.cookies.get(COUNTRY_SOURCE_COOKIE)?.value;
    const countrySource =
      storedSource === "auto" && storedCountry === countryFromPath
        ? "auto"
        : "explicit";

    const response = NextResponse.rewrite(rewriteUrl);
    response.cookies.set(COUNTRY_COOKIE, countryFromPath, {
      maxAge: 60 * 60 * 24 * 180,
      path: "/",
      sameSite: "lax",
    });
    response.cookies.set(COUNTRY_SOURCE_COOKIE, countrySource, {
      maxAge: 60 * 60 * 24 * 180,
      path: "/",
      sameSite: "lax",
    });
    response.headers.set("x-swifthelp-country", countryFromPath);
    return response;
  }

  const country = detectCountry(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = addCountryToPath(pathname, country);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(COUNTRY_COOKIE, country, {
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "lax",
  });
  response.cookies.set(COUNTRY_SOURCE_COOKIE, "auto", {
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};

function getCountryFromPath(pathname: string) {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return normalizeCountryCode(firstSegment);
}

function stripCountryFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const remainingSegments = segments.slice(1);
  return remainingSegments.length ? `/${remainingSegments.join("/")}` : "/";
}

function addCountryToPath(pathname: string, country: string) {
  if (pathname === "/") {
    return `/${country}`;
  }

  return `/${country}${pathname}`;
}

function detectCountry(request: NextRequest) {
  const cookieCountry = normalizeCountryCode(
    request.cookies.get(COUNTRY_COOKIE)?.value,
  );

  if (cookieCountry) {
    return cookieCountry;
  }

  for (const headerName of GEO_HEADER_NAMES) {
    const headerCountry = normalizeCountryCode(request.headers.get(headerName));

    if (headerCountry) {
      return headerCountry;
    }
  }

  return getCountryFromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_COUNTRY;
}

function getCountryFromAcceptLanguage(value: string | null) {
  if (!value) {
    return null;
  }

  const languageTags = value.split(",").map((tag) => tag.trim().split(";")[0]);

  for (const tag of languageTags) {
    const region = tag.match(/^[a-z]{2,3}-([a-z]{2})$/i)?.[1];
    const country = normalizeCountryCode(region);

    if (country) {
      return country;
    }
  }

  return null;
}

function normalizeCountryCode(value?: string | null) {
  if (!value) {
    return null;
  }

  const country = value.trim().toLowerCase();
  const normalizedCountry = country === "gb" ? "uk" : country;

  return SUPPORTED_COUNTRY_CODES.has(normalizedCountry) ? normalizedCountry : null;
}

function shouldBlockForMaintenance(pathname: string) {
  if (pathname === "/maintenance" || pathname.startsWith("/super-admin-platform")) {
    return false;
  }

  return MAINTENANCE_BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function isMaintenanceModeEnabled() {
  const now = Date.now();

  if (maintenanceCache && now < maintenanceCache.expiresAt) {
    return maintenanceCache.enabled;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/maintenance-status`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as {
      data?: { maintenanceMode?: boolean };
      maintenanceMode?: boolean;
    };
    const enabled = Boolean(payload.data?.maintenanceMode ?? payload.maintenanceMode);
    maintenanceCache = {
      enabled,
      expiresAt: now + MAINTENANCE_CACHE_TTL_MS,
    };

    return enabled;
  } catch {
    return false;
  }
}
