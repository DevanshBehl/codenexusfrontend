import { describe, it, expect } from 'vitest';
import { generateRefreshToken } from '../auth.service.js';

describe('Auth Service', () => {
  describe('generateRefreshToken', () => {
    it('should generate a 128 character hex token', () => {
      const token = generateRefreshToken();
      expect(token).toHaveLength(128);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens on each call', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });
});