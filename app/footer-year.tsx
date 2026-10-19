"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export default function FooterYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );

  return <>{year}</>;
}
