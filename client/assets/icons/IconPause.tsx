import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconPauseProps {
  size?: number;
  color?: string;
}

const IconPause: React.FC<IconPauseProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
        fill={color}
      />
    </Svg>
  );
};

export default IconPause; 