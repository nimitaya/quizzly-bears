import React from "react";
import Svg, { Path } from "react-native-svg";

interface IconVolumeProps {
  size?: number;
  color?: string;
}

const IconVolume: React.FC<IconVolumeProps> = ({ size = 24, color = "#000" }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.54 8.46C16.4774 9.39764 17.0039 10.7538 17.0039 12.165C17.0039 13.5762 16.4774 14.9324 15.54 15.87"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default IconVolume; 