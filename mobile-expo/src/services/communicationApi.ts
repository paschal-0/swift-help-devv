declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

export type MobileCommunicationRoomAccess = {
  provider: 'daily';
  roomId?: string;
  roomName: string;
  identity: string;
  displayName: string;
  meetingUrl: string | null;
  roomToken: string | null;
  expiresInSeconds: number;
  canJoin?: boolean;
  waitingRoomStatus?: 'waiting' | 'admitted' | 'denied' | 'joined' | 'left';
  sdk?: {
    provider: 'daily';
    mobileSdk?: {
      reactNativePackage: '@daily-co/react-native-daily-js';
      requiresMeetingUrl: boolean;
      requiresToken: boolean;
    };
  };
};

type RequestOptions = RequestInit & {
  accessToken: string;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:5000/api/v1';

async function communicationRequest<T>(path: string, options: RequestOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getMobileConsultationRoomAccess(
  roomId: string,
  accessToken: string,
) {
  return communicationRequest<MobileCommunicationRoomAccess>(
    `/communication/rooms/${encodeURIComponent(roomId)}/access`,
    {
      method: 'POST',
      accessToken,
    },
  );
}

export function buildDailyMobileJoinConfig(access: MobileCommunicationRoomAccess) {
  if (!access.canJoin || !access.meetingUrl || !access.roomToken) {
    return null;
  }

  return {
    url: access.meetingUrl,
    token: access.roomToken,
    userName: access.displayName,
  };
}
