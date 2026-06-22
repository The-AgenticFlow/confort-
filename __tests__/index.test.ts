import { greet } from '../src/index';

describe('greet', () => {
  it('returns a greeting for the given name', () => {
    expect(greet('World')).toBe('Hello, World!');
  });
});
