"use client";

export type TrackEventName =
  | "visit_landing"
  | "visit_calculator"
  | "calc_result"
  | "share_result"
  | "print_result"
  | "cta_save_draft"
  | "register_view";

/** Fire-and-forget funnel event. Never throws, never blocks navigation. */
export function track(name: TrackEventName, meta?: string) {
  try {
    let visitorId = localStorage.getItem("wiratha-vid");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("wiratha-vid", visitorId);
    }
    const body = JSON.stringify({ name, path: location.pathname, visitorId, meta });
    const sent = navigator.sendBeacon?.(
      "/api/track",
      new Blob([body], { type: "application/json" })
    );
    if (!sent) {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // storage/network unavailable — tracking is best-effort
  }
}
