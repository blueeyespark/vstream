import { blueRequest, blueApiUrl } from "./http";

export const auth = {
  me: () => blueRequest("/v1/auth/me"),
  logout: async () => {
    await blueRequest("/v1/auth/logout", { method: "POST" });
  },
  loginWithProvider: (provider, redirectUrl = "/") => {
    const url = new URL(`${blueApiUrl}/v1/auth/login/${encodeURIComponent(provider)}`);
    url.searchParams.set("redirect_url", redirectUrl);
    window.location.assign(url.toString());
  },
};
