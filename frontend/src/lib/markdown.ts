import { STATUS_OPTIONS } from '../data/catalog';
import type { BookmarkedProject, Project } from '../types';
import { isSafeUrl } from './url';

function projectBody(project: Project, headingLevel: number): string {
  const h = '#'.repeat(headingLevel);
  const lines = [
    `> ${project.description}`,
    '',
    `**Difficulty:** ${project.difficulty} · **Estimated time:** ${project.estimatedTime}`,
  ];

  if (project.techStack.length) {
    lines.push('', `${h} Tech stack`, '', ...project.techStack.map((t) => `- ${t}`));
  }
  if (project.learningOutcomes.length) {
    lines.push('', `${h} What you'll learn`, '', ...project.learningOutcomes.map((o) => `- [ ] ${o}`));
  }
  const links = project.resources.filter((r) => isSafeUrl(r.url));
  if (links.length) {
    lines.push('', `${h} Resources`, '', ...links.map((r) => `- [${r.name}](${r.url}) (${r.type})`));
  }
  return lines.join('\n');
}

// A README skeleton for starting the project.
export function projectToMarkdown(project: Project): string {
  return `# ${project.title}\n\n${projectBody(project, 2)}\n`;
}

export function bookmarksToMarkdown(bookmarks: BookmarkedProject[]): string {
  const sections = STATUS_OPTIONS.map(({ value, label }) => {
    const items = bookmarks.filter((b) => b.status === value);
    if (!items.length) return '';
    return `## ${label}\n\n${items.map((b) => `### ${b.title}\n\n${projectBody(b, 4)}`).join('\n\n')}`;
  }).filter(Boolean);

  return `# My SkillSync projects\n\n${sections.join('\n\n')}\n`;
}

export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
