import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Color } from '../../theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

export const MicrophoneIcon: React.FC<IconProps> = ({ size = 36, color = Color.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 3.2a3.2 3.2 0 0 0-3.2 3.2v5.2a3.2 3.2 0 1 0 6.4 0V6.4A3.2 3.2 0 0 0 12 3.2Z"
      fill={color}
    />
    <Path
      d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8v3.2M8.8 20.8h6.4"
      stroke={color}
      strokeWidth="1.7"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

export const KeyboardIcon: React.FC<IconProps> = ({ size = 16, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M3.5 7.2h17a1.3 1.3 0 0 1 1.3 1.3v7a1.3 1.3 0 0 1-1.3 1.3h-17A1.3 1.3 0 0 1 2.2 15.5v-7A1.3 1.3 0 0 1 3.5 7.2Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <Path d="M6 11h.8M9.2 11h.8M12.4 11h.8M15.6 11h.8M8 14.2h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const PinIcon: React.FC<IconProps> = ({ size = 16, color = Color.green }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 21s6.2-5.4 6.2-10.1A6.2 6.2 0 0 0 5.8 10.9C5.8 15.6 12 21 12 21Z"
      stroke={color}
      strokeWidth="1.6"
      fill="none"
    />
    <Circle cx="12" cy="10.6" r="2" fill={color} />
  </Svg>
);

export const CloudIcon: React.FC<IconProps> = ({ size = 16, color = Color.green }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7.4 17.6h10.2a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6-1.5A3.8 3.8 0 0 0 7.4 17.6Z"
      stroke={color}
      strokeWidth="1.6"
      fill="none"
    />
  </Svg>
);

export const SpeedIcon: React.FC<IconProps> = ({ size = 16, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 17.2A8 8 0 1 1 19 17.2"
      stroke={color}
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
    <Path d="M12 13.2 16 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <Circle cx="12" cy="13.4" r="1.2" fill={color} />
  </Svg>
);

export const CompassIcon: React.FC<IconProps> = ({ size = 16, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.6" fill="none" />
    <Path d="m14.8 9.2-1.3 5.3-5.3 1.3 1.3-5.3z" fill={color} />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 16, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.6" fill="none" />
    <Path d="M12 8v4.4l2.6 1.6" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 20, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="m4 11 8-7 8 7v9H4z" stroke={color} strokeWidth="1.6" fill="none" />
  </Svg>
);

export const MessagesIcon: React.FC<IconProps> = ({ size = 20, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 6.5h14v9.2H9.4L5 19.2z"
      stroke={color}
      strokeWidth="1.6"
      fill="none"
    />
  </Svg>
);

export const MenuIcon: React.FC<IconProps> = ({ size = 20, color = Color.silver }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 8h14M5 12h14M5 16h14" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
  </Svg>
);

export const CapIcon: React.FC<IconProps> = ({ size = 12, color = Color.brass }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="m3 10 9-5 9 5-9 5z" fill={color} />
    <Path d="M7 12.4v4.2c2.2 1.4 7.8 1.4 10 0v-4.2" stroke={color} strokeWidth="1.5" fill="none" />
  </Svg>
);
