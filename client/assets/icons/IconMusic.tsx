import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconMusicProps {
  size?: number;
  color?: string;
}

const IconMusic: React.FC<IconMusicProps> = ({ size = 24, color = '#000000' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
        fill={color}
      />
    </Svg>
  );
};

export default IconMusic; 