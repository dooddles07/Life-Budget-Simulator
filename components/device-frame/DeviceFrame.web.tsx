import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useWindowDimensions } from "react-native";

import { useTheme } from "@/hooks/useTheme";

/**
 * Web-only presentation shell.
 *
 * This is the one place `motion` (motiondivision/motion) runs: it is a React DOM
 * library with no React Native renderer, so it cannot drive the app screens --
 * those use Reanimated 4, which works on native and web alike. Here, on the web
 * target, motion animates the bezel entrance and an ambient glow that tracks the
 * pointer, giving the browser build a showcase frame.
 *
 * Below 900px the frame is dropped and the app goes full-bleed, which is the
 * real mobile presentation.
 */

const PHONE_W = 390;
const PHONE_H = 844;

export function DeviceFrame({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  const framed = width >= 900;

  useEffect(() => {
    if (!framed || reduced) return;
    const onMove = (e: PointerEvent) => {
      setPointer({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [framed, reduced]);

  if (!framed) return <>{children}</>;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(120% 120% at 50% 0%, ${theme.bgElevated} 0%, ${theme.bg} 60%)`,
        overflow: "hidden",
      }}
    >
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.primary}44 0%, transparent 65%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
        animate={{
          x: (pointer.x - 0.5) * 160,
          y: (pointer.y - 0.5) * 160,
        }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
      />

      <motion.div
        initial={reduced ? false : { scale: 0.94, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        style={{
          position: "relative",
          width: PHONE_W + 20,
          height: PHONE_H + 20,
          maxHeight: "94vh",
          borderRadius: 58,
          padding: 10,
          background: "linear-gradient(160deg, #2A2A3E 0%, #101018 55%, #2A2A3E 100%)",
          boxShadow: `0 40px 120px -20px ${theme.primary}55, 0 0 0 1px rgba(255,255,255,0.06)`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 48,
            overflow: "hidden",
            background: theme.bg,
            display: "flex",
          }}
        >
          {children}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 112,
              height: 30,
              borderRadius: 999,
              background: "#05050A",
              zIndex: 50,
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
