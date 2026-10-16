// Pont de synchronisation local-first (mobile).
// L'appareil écrit toujours d'abord en local ; cette passerelle pousse ensuite vers le
// serveur, avec un anti-rebond par vêtement, et tire l'état distant à la connexion.
import { useCallback, useEffect, useRef, useState } from "react";
import { authClient } from "./auth";
import { client } from "./api";
import type { Branding, Draft, UsageEntry } from "./store";

export type SyncState = "idle" | "syncing" | "synced" | "error";

export interface RemoteState {
  drafts?: Draft[];
  branding?: Branding;
  usage?: UsageEntry[];
}

export function useSyncBridge() {
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session);
  const [state, setState] = useState<SyncState>("idle");
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const flash = useCallback((next: SyncState) => {
    setState(next);
    if (next === "synced") {
      setTimeout(() => setState((s) => (s === "synced" ? "idle" : s)), 1800);
    }
  }, []);

  const pushDraft = useCallback(
    (draft: Draft) => {
      if (!signedIn) return;
      const key = draft.garmentId;
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          void (async () => {
            try {
              await client.drafts.upsert({
                garmentId: draft.garmentId,
                values: draft.values,
                size: draft.size,
                coupe: draft.coupe,
                updatedAt: draft.updatedAt,
              });
              flash("synced");
            } catch {
              flash("error");
            }
          })();
        }, 900),
      );
    },
    [signedIn, flash],
  );

  const pushBranding = useCallback(
    (branding: Branding) => {
      if (!signedIn) return;
      void (async () => {
        try {
          await client.branding.upsert({ ...branding, updatedAt: Date.now() });
          flash("synced");
        } catch {
          flash("error");
        }
      })();
    },
    [signedIn, flash],
  );

  const bump = useCallback(
    (garmentId: string) => {
      if (!signedIn) return;
      void client.usage.bump({ garmentId }).catch(() => flash("error"));
    },
    [signedIn, flash],
  );

  const pull = useCallback(
    async (merge: (remote: RemoteState) => void | Promise<void>) => {
      if (!signedIn) return;
      setState("syncing");
      try {
        const [drafts, branding, usage] = await Promise.all([
          client.drafts.list(),
          client.branding.get(),
          client.usage.list(),
        ]);
        await merge({
          drafts: drafts.map((d) => ({
            garmentId: d.garmentId,
            values: d.values as Draft["values"],
            size: (d.size as Draft["size"]) ?? null,
            coupe: d.coupe as Draft["coupe"],
            updatedAt: d.updatedAt,
          })),
          branding: branding
            ? {
                shopName: branding.shopName,
                logoDataUrl: branding.logoDataUrl,
                showWatermark: branding.showWatermark,
              }
            : undefined,
          usage: usage.map((u) => ({ garmentId: u.garmentId, count: u.count, lastUsed: u.lastUsed })),
        });
        flash("synced");
      } catch {
        flash("error");
      }
    },
    [signedIn, flash],
  );

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    },
    [],
  );

  return { signedIn, state, pushDraft, pushBranding, bump, pull };
}
