/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // "media" makes NativeWind's web runtime throw when the app switches theme;
  // "class" lets the PrefsProvider own the scheme instead.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Mirrors constants/theme.ts -- keep both in sync when tokens change.
        ink: {
          950: "#08080F",
          900: "#0D0D18",
          850: "#12121F",
          800: "#1A1A2E",
          700: "#252540",
        },
        violet: {
          DEFAULT: "#7C3AED",
          bright: "#A78BFA",
        },
        lime: { DEFAULT: "#A3E635" },
        gain: { DEFAULT: "#22C55E" },
        loss: { DEFAULT: "#F43F5E" },
        warn: { DEFAULT: "#FBBF24" },
      },
      fontFamily: {
        display: ["Outfit_700Bold"],
        "display-md": ["Outfit_600SemiBold"],
        body: ["PlusJakartaSans_400Regular"],
        "body-md": ["PlusJakartaSans_500Medium"],
        "body-sb": ["PlusJakartaSans_600SemiBold"],
      },
    },
  },
  plugins: [],
};
