import { GithubIcon, XLogoIcon } from './icons';

const linkClass = 'inline-flex items-center gap-2 rounded-[6px] text-[13px] text-muted transition-colors hover:text-fg';

export default function Footer() {
  return (
    <footer className="border-t border-border pb-32 pt-6 lg:pb-6">
      <div className="mx-auto flex max-w-page flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-6">
          <a href="https://github.com/shubhook/skillsync.ai" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <GithubIcon /> GitHub
          </a>
          <a href="https://x.com/khakha_x" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <XLogoIcon /> X
          </a>
        </div>
        <p className="text-[13px] text-muted">
          Made by{' '}
          <a href="https://x.com/ShubhamKhakha" target="_blank" rel="noopener noreferrer" className="rounded-[6px] text-fg hover:underline hover:underline-offset-4">
            Shubham
          </a>
        </p>
      </div>
    </footer>
  );
}
