import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  style?: any;
  size?: number;
  color?: string;
}

const IconTrophy = ({ style, size = 24, color = "#000" }: Props) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <Path d="M8 21h8" />
      <Path d="M12 17v4" />
      <Path d="M17 7c0 3 2 5 2 5H5s2-2 2-5" />
      <Path d="M8 2h8v5h-8V2z" />
    </Svg>
  );
};

export default IconTrophy;
