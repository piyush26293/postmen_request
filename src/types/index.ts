export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type BodyType = 'json' | 'form-urlencoded' | 'raw' | 'none';
export type AuthType = 'none' | 'bearer' | 'api-key' | 'custom';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: BodyType;
  body: string;
  timeout: number;
  collectionId: string | null;
  notes: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
  createdAt: string;
  updatedAt: string;
}

export interface HeaderTemplate {
  id: string;
  name: string;
  headers: KeyValuePair[];
  createdAt: string;
}

export interface RunHistoryItem {
  id: string;
  requestId: string;
  requestName: string;
  method: HttpMethod;
  url: string;
  statusCode: number | null;
  duration: number;
  timestamp: string;
  responseBody: string;
  responseHeaders: Record<string, string>;
  error: string | null;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  pinEnabled: boolean;
  pinHash: string | null;
  activeEnvironmentId: string | null;
  showSecrets: boolean;
}

export interface RunResult {
  statusCode: number;
  statusText: string;
  duration: number;
  responseBody: string;
  responseHeaders: Record<string, string>;
  size: number;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

// Electron API types
export interface ElectronAPI {
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  request: {
    run: (requestData: any) => Promise<RunResult>;
  };
  app: {
    getVersion: () => Promise<string>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}