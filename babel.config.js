module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // react-native-worklets/plugin must stay last -- Reanimated 4 worklets fail silently otherwise.
    plugins: ["react-native-worklets/plugin"],
  };
};
