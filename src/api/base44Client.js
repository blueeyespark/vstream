import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const shouldUseViteProxy = import.meta.env.DEV && Boolean(import.meta.env.VITE_BASE44_APP_BASE_URL);

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: shouldUseViteProxy ? '' : appBaseUrl,
  requiresAuth: false,
  appBaseUrl
});
