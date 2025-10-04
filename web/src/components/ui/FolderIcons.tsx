import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Folder Icons
export const FolderIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
  </svg>
);

export const FolderOpenIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 20H4C2.89 20 2 19.1 2 18V6C2 4.89 2.89 4 4 4H10L12 6H20C21.1 6 22 6.89 22 8H21L19 20Z" fill="currentColor"/>
  </svg>
);

export const TargetIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

export const RocketIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4.5 16.5C4.5 17.88 5.62 19 7 19S9.5 17.88 9.5 16.5 8.38 14 7 14 4.5 15.12 4.5 16.5ZM6 10.5C6 12 7 13 8.5 13S11 12 11 10.5 10 8 8.5 8 6 9 6 10.5ZM12 1L21 5V12C21 16 16.5 20 12 23C7.5 20 3 16 3 12V5L12 1Z" fill="currentColor"/>
  </svg>
);

export const StarIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
  </svg>
);

export const FireIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13.5 0.67S10.25 3.65 10.25 7.1C10.25 8.72 11.54 10 13.16 10S16.07 8.72 16.07 7.1C16.07 5.06 14.96 3.23 13.5 0.67ZM7.34 6.79C7.34 6.79 5.3 8.12 5.3 10.1C5.3 11.12 6.13 11.95 7.15 11.95S8.99 11.12 8.99 10.1C8.99 8.95 8.28 7.93 7.34 6.79ZM12 12.9C8.13 12.9 5 16.03 5 19.9C5 21.61 6.39 23 8.1 23H15.9C17.61 23 19 21.61 19 19.9C19 16.03 15.87 12.9 12 12.9Z" fill="currentColor"/>
  </svg>
);

export const DiamondIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" fill="currentColor"/>
  </svg>
);

export const PaletteIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C13.1 2 14.1 2.4 14.8 3.1C15.5 3.8 15.9 4.8 15.9 5.9C15.9 7 15.5 8 14.8 8.7C14.1 9.4 13.1 9.8 12 9.8C10.9 9.8 9.9 9.4 9.2 8.7C8.5 8 8.1 7 8.1 5.9C8.1 4.8 8.5 3.8 9.2 3.1C9.9 2.4 10.9 2 12 2ZM12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22Z" fill="currentColor"/>
  </svg>
);

export const ChartIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3V21H21V19H5V3H3ZM9.5 17H7.5V10H9.5V17ZM13.5 17H11.5V7H13.5V17ZM17.5 17H15.5V13H17.5V17Z" fill="currentColor"/>
  </svg>
);

export const HeartIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor"/>
  </svg>
);

export const ShoppingIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 18C5.9 18 5.01 18.9 5.01 20S5.9 22 7 22 9 21.1 9 20 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.58 17.3 11.97L20.88 5H5.21L4.27 3H1ZM17 18C15.9 18 15.01 18.9 15.01 20S15.9 22 17 22 19 21.1 19 20 18.1 18 17 18Z" fill="currentColor"/>
  </svg>
);

export const BuildingIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill="currentColor"/>
  </svg>
);

export const BookIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H7V9L9.5 7.5L12 9V4H18V20Z" fill="currentColor"/>
  </svg>
);

export const ToolIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 20 23.1 19.3 22.7 19Z" fill="currentColor"/>
  </svg>
);

export const GlobeIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12S6.47 22 11.99 22C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM18.92 8H15.97C15.65 6.75 15.19 5.55 14.59 4.44C16.43 5.07 17.96 6.35 18.92 8ZM12 4.04C12.83 5.24 13.48 6.57 13.91 8H10.09C10.52 6.57 11.17 5.24 12 4.04ZM4.26 14C4.1 13.36 4 12.69 4 12S4.1 10.64 4.26 10H7.64C7.56 10.66 7.5 11.32 7.5 12S7.56 13.34 7.64 14H4.26ZM5.08 16H8.03C8.35 17.25 8.81 18.45 9.41 19.56C7.57 18.93 6.04 17.65 5.08 16ZM8.03 8H5.08C6.04 6.35 7.57 5.07 9.41 4.44C8.81 5.55 8.35 6.75 8.03 8ZM12 19.96C11.17 18.76 10.52 17.43 10.09 16H13.91C13.48 17.43 12.83 18.76 12 19.96ZM14.34 14H9.66C9.57 13.34 9.5 12.68 9.5 12S9.57 10.66 9.66 10H14.34C14.43 10.66 14.5 11.32 14.5 12S14.43 13.34 14.34 14ZM14.59 19.56C15.19 18.45 15.65 17.25 15.97 16H18.92C17.96 17.65 16.43 18.93 14.59 19.56ZM16.36 14C16.44 13.34 16.5 12.68 16.5 12S16.44 10.66 16.36 10H19.74C19.9 10.64 20 11.31 20 12S19.9 13.36 19.74 14H16.36Z" fill="currentColor"/>
  </svg>
);

// Icon mapping for easy access
export const FOLDER_ICONS = {
  folder: FolderIcon,
  folderOpen: FolderOpenIcon,
  target: TargetIcon,
  rocket: RocketIcon,
  star: StarIcon,
  fire: FireIcon,
  diamond: DiamondIcon,
  palette: PaletteIcon,
  chart: ChartIcon,
  heart: HeartIcon,
  shopping: ShoppingIcon,
  building: BuildingIcon,
  book: BookIcon,
  tool: ToolIcon,
  globe: GlobeIcon,
};

export type FolderIconType = keyof typeof FOLDER_ICONS;