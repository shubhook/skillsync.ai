// Small inline icons (24x24 grid, stroke-based unless noted). Decorative by default.
type IconProps = { className?: string };

function Stroke({ className = 'h-4 w-4', d }: IconProps & { d: string | string[] }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((path) => <path key={path} d={path} />)}
    </svg>
  );
}

export const BookmarkIcon = ({ className, filled }: IconProps & { filled?: boolean }) => (
  <svg className={className ?? 'h-4 w-4'} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);
export const CloseIcon = (p: IconProps) => <Stroke {...p} d="M6 18L18 6M6 6l12 12" />;
export const CheckIcon = (p: IconProps) => <Stroke {...p} d="M5 13l4 4L19 7" />;
export const ClockIcon = (p: IconProps) => <Stroke {...p} d={['M12 8v4l3 3', 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z']} />;
export const ChevronDownIcon = (p: IconProps) => <Stroke {...p} d="M19 9l-7 7-7-7" />;
export const SunIcon = (p: IconProps) => (
  <Stroke {...p} d={['M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707', 'M16 12a4 4 0 11-8 0 4 4 0 018 0z']} />
);
export const MoonIcon = (p: IconProps) => <Stroke {...p} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />;
export const CopyIcon = (p: IconProps) => <Stroke {...p} d={['M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2', 'M10 8h8a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-8a2 2 0 012-2z']} />;
export const SparkIcon = (p: IconProps) => <Stroke {...p} d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />;
export const ArrowDownIcon = (p: IconProps) => <Stroke {...p} d="M12 5v14m0 0l-6-6m6 6l6-6" />;
export const ArrowUpIcon = (p: IconProps) => <Stroke {...p} d="M12 19V5m0 0l-6 6m6-6l6 6" />;
export const ExternalLinkIcon = (p: IconProps) => <Stroke {...p} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />;
export const DownloadIcon = (p: IconProps) => <Stroke {...p} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />;
export const TrashIcon = (p: IconProps) => <Stroke {...p} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16M10 3h4a1 1 0 011 1v3H9V4a1 1 0 011-1z" />;
export const AlertIcon = (p: IconProps) => <Stroke {...p} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
export const RefreshIcon = (p: IconProps) => <Stroke {...p} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />;

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
