export function getTimeAsMinutes(value?: string | null) {
  if (!value) return null;

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export function getDurationMinutes(startTime?: string | null, endTime?: string | null) {
  const start = getTimeAsMinutes(startTime);
  const end = getTimeAsMinutes(endTime);
  if (start === null || end === null) return null;

  const duration = end - start;
  return duration > 0 ? duration : null;
}

export function formatDurationMinutes(durationMinutes?: number | null, fallback = "-") {
  if (!durationMinutes || durationMinutes <= 0) return fallback;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const parts: string[] = [];

  if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);

  return parts.join(" ") || fallback;
}

export function formatDurationFromTimes(
  startTime?: string | null,
  endTime?: string | null,
  fallback = "-",
) {
  return formatDurationMinutes(getDurationMinutes(startTime, endTime), fallback);
}
