import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { Color } from '../../theme/tokens';

interface VesselMarkProps {
  size?: number;
  framed?: boolean;
}

export const VesselMark: React.FC<VesselMarkProps> = ({ size = 44, framed = true }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="SOGN SAFE Vessel mark">
      {framed ? (
        <Rect x="2" y="2" width="60" height="60" rx="14" fill={Color.surfaceRaised} stroke={Color.silver} strokeWidth="1.4" />
      ) : null}
      <Path
        d="M32 14c4.2 0 6.2 2.4 6.2 2.4M32 14c-4.2 0-6.2 2.4-6.2 2.4"
        stroke={Color.silverBright}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M32 16c6.4 0 9.4 3.6 9.4 3.6"
        stroke={Color.silver}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M31.2 18h1.6v8h-1.6z" fill={Color.silverBright} />
      <Path d="M24 28h16l2.4 6H21.6L24 28z" fill={Color.silver} />
      <Path d="M22 34h20l4 8H18l4-8z" fill={Color.silverBright} />
      <Path d="M26 30.2h2.2v1.4H26zm5 0H33.2v1.4H31zm5 0H38.2v1.4H36z" fill={Color.canvas} />
      <Path
        d="M18 46c4-3 8-3 14-3s10 0 14 3"
        stroke={Color.silver}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M20 50c3.6-2.2 7.4-2.2 12-2.2s8.4 0 12 2.2"
        stroke={Color.silverDim}
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};
