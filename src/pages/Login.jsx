import { useEffect, useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Chrome, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

const getSafeReturnUrl = (fromUrl) => {
  if (!fromUrl || fromUrl === "/login") return "/";

  try {
    const parsedUrl = new URL(fromUrl, window.location.origin);
    if (parsedUrl.origin !== window.location.origin || parsedUrl.pathname === "/login") {
      return "/";
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return "/";
  }
};

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, authChecked, authError, loginWithGoogle } = useAuth();

  const returnUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return getSafeReturnUrl(params.get("from_url"));
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated && authChecked) {
      navigate(returnUrl, { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate, returnUrl]);

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="min-h-screen bg-[#03080f] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#1e78ff]" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={returnUrl} replace />;
  }

  return (
    <main className="min-h-screen bg-[#03080f] text-[#e8f4ff] flex items-center justify-center px-4">
      <section className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl border border-[#1e78ff]/40 bg-[#1e78ff]/15 flex items-center justify-center">
            <span className="text-[#1e78ff] text-xl font-black">V</span>
          </div>
          <h1 className="text-2xl font-black tracking-wide">Sign in to VStream</h1>
          <p className="mt-2 text-sm text-blue-300/60">
            Use your Google account to continue.
          </p>
        </div>

        <div className="rounded-xl border border-blue-900/40 bg-[#060d18] p-5 shadow-2xl shadow-black/40">
          {authError?.message && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {authError.message}
            </div>
          )}

          <Button
            type="button"
            onClick={() => loginWithGoogle(returnUrl)}
            className="w-full bg-[#1e78ff] hover:bg-[#3d8fff] text-white font-bold"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-300/45">
            <LogIn className="h-3.5 w-3.5" />
            You will return to VStream after Google verifies your account.
          </div>
        </div>
      </section>
    </main>
  );
}
