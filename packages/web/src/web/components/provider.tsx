import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "../lib/auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

interface ProviderProps {
  children: React.ReactNode;
}

// App-level providers. QueryClientProvider must stay (all API calls run through TanStack Query).
export function Provider({ children }: ProviderProps) {
  // A returning managed sign-in finishes here, once, before routes render.
  // A no-op unless the URL carries the auth redirect params.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void authClient.managedAuth.handleRedirect().finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) return <div className="min-h-screen t-bg" />;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
