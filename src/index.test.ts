import { describe, it, expect } from 'vitest';
import { greet } from './index';

describe('greet', () => {
  it('returns a greeting', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
