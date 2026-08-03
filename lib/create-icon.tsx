import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

// lucide-react-native's API takes `size` (maps to both width and height).
// react-native-svg-transformer's generated components only know the plain
// SvgProps shape, so this bridges the two -- every other prop (color,
// strokeWidth, ...) passes straight through unchanged.
export type IconProps = { size?: number } & Omit<SvgProps, "width" | "height">;
export type IconComponent = ComponentType<IconProps>;

export function createIcon(Svg: ComponentType<SvgProps>): IconComponent {
  return function Icon({ size, ...props }: IconProps) {
    return <Svg width={size} height={size} {...props} />;
  };
}
