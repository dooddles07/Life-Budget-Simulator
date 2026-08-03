const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer/expo");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");

module.exports = withNativeWind(config, { input: "./global.css" });
