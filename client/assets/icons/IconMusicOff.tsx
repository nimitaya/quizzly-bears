import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconMusicOffProps {
  size?: number;
  color?: string;
}

const IconMusicOff: React.FC<IconMusicOffProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2z"
        fill={color}
      />
    </Svg>
  );
};

export default IconMusicOff; 