import { GithubIcon, XLogoIcon } from './icons';

const linkClass = 'inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg';

export default function Footer() {
  return (
    <footer className="border-t border-border pb-32 pt-8 lg:pb-8">
      <div className="mx-auto flex max-w-page flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-6">
          <a href="https://github.com/shubhook/skillsync.ai" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <GithubIcon /> GitHub
          </a>
          <a href="https://x.com/khakha_x" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <XLogoIcon /> X
          </a>
        </div>
        <p className="text-sm text-muted">
          Made by{' '}
          <a href="https://x.com/ShubhamKhakha" target="_blank" rel="noopener noreferrer" className="font-medium text-fg hover:underline">
            Shubham
          </a>
        </p>
      </div>
    </footer>
  );
}
