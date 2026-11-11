// Iconos de trazo, heredan el color del texto
type IconProps = { size?: number, className?: string }

function Svg ({ size = 22, className, children, strokeWidth = 2 }: IconProps & { children: React.ReactNode, strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={strokeWidth}
      strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' className={className}>
      {children}
    </svg>
  )
}

export const BookIcon = (p: IconProps) => <Svg {...p}><path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z' /><path d='M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5' /></Svg>
export const BasketIcon = (p: IconProps) => <Svg {...p}><path d='M5 8h14l-1.5 12h-11z' /><path d='M9 8a3 3 0 0 1 6 0' /></Svg>
export const UserIcon = (p: IconProps) => <Svg {...p}><circle cx='12' cy='8' r='4' /><path d='M4 21a8 8 0 0 1 16 0' /></Svg>
export const PlusIcon = (p: IconProps) => <Svg strokeWidth={2.2} {...p}><path d='M12 5v14M5 12h14' /></Svg>
export const SearchIcon = (p: IconProps) => <Svg {...p}><circle cx='11' cy='11' r='7' /><path d='m20 20-3.5-3.5' /></Svg>
export const ChevronLeftIcon = (p: IconProps) => <Svg {...p}><path d='m15 18-6-6 6-6' /></Svg>
export const ChevronRightIcon = (p: IconProps) => <Svg {...p}><path d='m9 6 6 6-6 6' /></Svg>
export const CloseIcon = (p: IconProps) => <Svg strokeWidth={2.2} {...p}><path d='M6 6l12 12M18 6 6 18' /></Svg>
export const TrendUpIcon = (p: IconProps) => <Svg {...p}><path d='M3 17l6-6 4 4 8-8' /><path d='M14 7h7v7' /></Svg>
export const PencilIcon = (p: IconProps) => <Svg {...p}><path d='M12 20h9' /><path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' /></Svg>
export const AlertIcon = (p: IconProps) => <Svg {...p}><path d='M12 9v4M12 17h.01' /><path d='M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' /></Svg>
export const LayersIcon = (p: IconProps) => <Svg {...p}><path d='m12 3 9 5-9 5-9-5z' /><path d='m3 13 9 5 9-5' /></Svg>
