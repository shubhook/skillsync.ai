// Small inline icons in the lucide style: 24x24 grid, 1.5 stroke. Decorative by default.
type IconProps = { className?: string };

function Stroke({ className = 'h-4 w-4', d }: IconProps & { d: string | string[] }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((path) => <path key={path} d={path} />)}
    </svg>
  );
}

export const BookmarkIcon = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg className={className ?? 'h-4 w-4'} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);
export const CloseIcon = (p: IconProps) => <Stroke {...p} d={['M18 6 6 18', 'm6 6 12 12']} />;
export const CheckIcon = (p: IconProps) => <Stroke {...p} d="M20 6 9 17l-5-5" />;
export const ChevronDownIcon = (p: IconProps) => <Stroke {...p} d="m6 9 6 6 6-6" />;
export const SunIcon = (p: IconProps) => (
  <Stroke {...p} d={['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41']} />
);
export const MoonIcon = (p: IconProps) => <Stroke {...p} d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />;
export const MonitorIcon = (p: IconProps) => <Stroke {...p} d={['M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M8 21h8', 'M12 17v4']} />;
export const CopyIcon = (p: IconProps) => <Stroke {...p} d={['M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z', 'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2']} />;
export const LayersIcon = (p: IconProps) => (
  <Stroke {...p} d={['m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z', 'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65', 'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65']} />
);
export const SlidersIcon = (p: IconProps) => (
  <Stroke {...p} d={['M20 7h-9', 'M14 17H5', 'M17 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z']} />
);
export const CornerDownRightIcon = (p: IconProps) => <Stroke {...p} d={['m15 10 5 5-5 5', 'M4 4v7a4 4 0 0 0 4 4h12']} />;
export const ArrowDownIcon = (p: IconProps) => <Stroke {...p} d={['M12 5v14', 'm19 12-7 7-7-7']} />;
export const ArrowUpIcon = (p: IconProps) => <Stroke {...p} d={['m5 12 7-7 7 7', 'M12 19V5']} />;
export const ArrowUpRightIcon = (p: IconProps) => <Stroke {...p} d={['M7 7h10v10', 'M7 17 17 7']} />;
export const DownloadIcon = (p: IconProps) => <Stroke {...p} d={['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3']} />;
export const TrashIcon = (p: IconProps) => <Stroke {...p} d={['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2']} />;
export const AlertIcon = (p: IconProps) => <Stroke {...p} d={['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 8v4', 'M12 16h.01']} />;
export const RefreshIcon = (p: IconProps) => (
  <Stroke {...p} d={['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5']} />
);

export const GithubIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

export const XLogoIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
