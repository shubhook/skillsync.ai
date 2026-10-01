import { describe, expect, it } from 'vitest';
import { isSafeUrl } from './url';

describe('isSafeUrl', () => {
  it('accepts http and https', () => {
    expect(isSafeUrl('https://react.dev')).toBe(true);
    expect(isSafeUrl('http://example.com/docs')).toBe(true);
  });

  it('rejects other protocols, relative paths, and junk', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html,hi')).toBe(false);
    expect(isSafeUrl('/docs')).toBe(false);
    expect(isSafeUrl('Not available')).toBe(false);
    expect(isSafeUrl('')).toBe(false);
  });
});
