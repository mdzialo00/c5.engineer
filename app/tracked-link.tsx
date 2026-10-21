"use client";

import posthog from "posthog-js";
import type { ComponentProps } from "react";

type TrackedLinkProps = ComponentProps<"a"> & { event: string };

export function TrackedLink({
  event,
  href,
  onClick,
  ...rest
}: TrackedLinkProps) {
  return (
    <a
      {...rest}
      href={href}
      onClick={(e) => {
        try {
          posthog.capture(event, { href }, { transport: "sendBeacon" });
        } catch {}
        onClick?.(e);
      }}
    />
  );
}
