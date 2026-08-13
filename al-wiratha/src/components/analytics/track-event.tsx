"use client";
import { useEffect, useRef } from "react";
import { track, type TrackEventName } from "@/lib/analytics-client";

/** Fires a funnel event once per mount — drop into any server-rendered page. */
export function TrackEvent({ name }: { name: TrackEventName }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(name);
  }, [name]);
  return null;
}
