import type { ReactNode } from "react";

/**
 * On iOS and Android the app already fills the device, so this is a pass-through.
 * Metro resolves DeviceFrame.web.tsx instead when bundling for web, where the
 * app is presented inside a phone bezel.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
