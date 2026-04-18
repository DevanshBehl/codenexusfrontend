import { describe, it, expect } from 'vitest';
import { canSendMail } from '../permission-matrix.js';

const PERMISSION_MATRIX: Record<string, string[]> = {
    STUDENT: ["UNIVERSITY"],
    UNIVERSITY: ["STUDENT", "COMPANY_ADMIN"],
    COMPANY_ADMIN: ["STUDENT", "UNIVERSITY", "RECRUITER"],
    RECRUITER: ["COMPANY_ADMIN"],
};

describe('Mail Permission Matrix', () => {
  it('should have entries for all sender roles', () => {
    const roles = Object.keys(PERMISSION_MATRIX);
    expect(roles).toContain('STUDENT');
    expect(roles).toContain('UNIVERSITY');
    expect(roles).toContain('COMPANY_ADMIN');
    expect(roles).toContain('RECRUITER');
  });

  it('should allow students to send mail to universities', () => {
    expect(canSendMail('STUDENT', 'UNIVERSITY')).toBe(true);
  });

  it('should allow companies to send mail to students', () => {
    expect(canSendMail('COMPANY_ADMIN', 'STUDENT')).toBe(true);
  });

  it('should allow recruiters to send mail to companies', () => {
    expect(canSendMail('RECRUITER', 'COMPANY_ADMIN')).toBe(true);
  });

  it('should not allow students to send mail to other students by default', () => {
    expect(canSendMail('STUDENT', 'STUDENT')).toBe(false);
  });

  it('should allow companies to send mail to universities', () => {
    expect(canSendMail('COMPANY_ADMIN', 'UNIVERSITY')).toBe(true);
  });
});