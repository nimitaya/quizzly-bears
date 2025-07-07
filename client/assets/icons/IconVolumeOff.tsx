import React from "react";
import Svg, { Path, Line } from "react-native-svg";

interface IconVolumeOffProps {
  size?: number;
  color?: string;
}

const IconVolumeOff: React.FC<IconVolumeOffProps> = ({ size = 24, color = "#000" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="23"
        y1="9"
        x2="17"
        y2="15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="17"
        y1="9"
        x2="23"
        y2="15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default IconVolumeOff; 