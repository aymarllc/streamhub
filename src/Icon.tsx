// Small line icons in the spirit of system symbols. Stroke uses currentColor so they follow text color.
const PATHS = {
  home: 'M3.5 10.5 12 3.5l8.5 7M5.5 9v10.5h4.5v-6h4v6h4.5V9',
  tv: 'M3.5 5.5h17v11h-17zM8.5 20h7M10 9.5v4l3.5-2z',
  music: 'M9 18.5V6l11-2.5v12.5M9 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM20 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  close: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  external: 'M14 4.5h5.5V10M19.5 4.5 11 13M17 13.5V19.5H4.5V7H10.5',
  play: 'M8 5.5v13l10.5-6.5z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} fill={name === 'play' ? 'currentColor' : 'none'} />
    </svg>
  )
}
