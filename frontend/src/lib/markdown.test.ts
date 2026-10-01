import { describe, expect, it } from 'vitest';
import type { BookmarkedProject, Project } from '../types';
import { bookmarksToMarkdown, projectToMarkdown } from './markdown';

const project: Project = {
  title: 'Trail Buddy',
  description: 'Plans hikes.',
  difficulty: 'Beginner',
  estimatedTime: '1 week',
  techStack: ['Go'],
  learningOutcomes: ['HTTP clients'],
  resources: [
    { name: 'Go docs', type: 'Documentation', url: 'https://go.dev/doc' },
    { name: 'Broken', type: 'Video', url: 'javascript:alert(1)' },
  ],
};

describe('projectToMarkdown', () => {
  it('builds a README skeleton and skips unsafe links', () => {
    const md = projectToMarkdown(project);
    expect(md).toContain('# Trail Buddy');
    expect(md).toContain('**Difficulty:** Beginner');
    expect(md).toContain('- [ ] HTTP clients');
    expect(md).toContain('- [Go docs](https://go.dev/doc) (Documentation)');
    expect(md).not.toContain('javascript:');
  });
});

describe('bookmarksToMarkdown', () => {
  it('groups bookmarks by status and skips empty groups', () => {
    const bookmarks: BookmarkedProject[] = [
      { ...project, id: '1', bookmarkedAt: 1, status: 'building' },
      { ...project, title: 'Second', id: '2', bookmarkedAt: 2, status: 'saved' },
    ];
    const md = bookmarksToMarkdown(bookmarks);
    expect(md.indexOf('## Saved')).toBeLessThan(md.indexOf('## Building'));
    expect(md).not.toContain('## Done');
    expect(md).toContain('### Second');
  });
});
