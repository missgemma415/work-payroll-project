// Cloudflare Pages Functions Types
export interface Env {
  JWT_SECRET?: string;
  GOOGLE_GEMINI_API_KEY?: string;
  GOOGLE_GEMINI_MODEL?: string;
}

export interface EventContext<TEnv = Env> {
  request: Request;
  env: TEnv;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

export type PagesFunction<TEnv = Env> = (
  context: EventContext<TEnv>
) => Response | Promise<Response>;
