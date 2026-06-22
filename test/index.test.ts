import { describe, it, expect } from 'vitest';
import { greet } from '../src/index';

describe('greet', () => {
  it('returns a greeting', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
