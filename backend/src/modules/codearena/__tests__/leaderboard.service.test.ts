import { describe, it, expect } from 'vitest';
import {
    calculateGlobalScore,
    calculateContestScore,
} from '../leaderboard.service.js';

// ─── calculateGlobalScore ─────────────────────────────────────────────────────

describe('calculateGlobalScore', () => {
    it('returns 0 for 0 problems solved', () => {
        expect(calculateGlobalScore(0)).toBe(0);
    });

    it('returns 100 per problem solved', () => {
        expect(calculateGlobalScore(1)).toBe(100);
        expect(calculateGlobalScore(10)).toBe(1000);
        expect(calculateGlobalScore(50)).toBe(5000);
    });

    it('scales linearly', () => {
        const a = calculateGlobalScore(5);
        const b = calculateGlobalScore(10);
        expect(b).toBe(a * 2);
    });
});

// ─── calculateContestScore ────────────────────────────────────────────────────

describe('calculateContestScore', () => {
    it('awards 10 000 points per problem solved', () => {
        expect(calculateContestScore(1, 0, 0)).toBe(10000);
        expect(calculateContestScore(3, 0, 0)).toBe(30000);
    });

    it('deducts 50 points per wrong attempt', () => {
        expect(calculateContestScore(1, 1, 0)).toBe(9950);
        expect(calculateContestScore(1, 4, 0)).toBe(9800);
    });

    it('deducts 1 point per minute of time taken', () => {
        expect(calculateContestScore(1, 0, 30)).toBe(9970);
        expect(calculateContestScore(1, 0, 120)).toBe(9880);
    });

    it('combines all three deductions correctly', () => {
        // 2 solved × 10 000 = 20 000; 3 wrong × 50 = 150; 45 min = 45
        expect(calculateContestScore(2, 3, 45)).toBe(20000 - 150 - 45);
    });

    it('can produce a negative score when penalties exceed base points', () => {
        const score = calculateContestScore(0, 200, 0);
        expect(score).toBeLessThan(0);
    });

    it('returns 0 for no activity', () => {
        expect(calculateContestScore(0, 0, 0)).toBe(0);
    });
});
