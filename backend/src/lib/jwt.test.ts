import { describe, it, expect } from '@jest/globals';
import { signToken, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';
import { ApiError } from './api-error';
import { Role } from '@prisma/client';

describe('JWT Utilities', () => {
  const testPayload = { userId: 'test-user-id', email: 'test@example.com', role: Role.CLIENT };

  describe('signToken', () => {
    it('should sign a token with correct payload', () => {
      const token = signToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });
  });

  describe('signAccessToken', () => {
    it('should create access token with user data', () => {
      const token = signAccessToken({ userId: 'user-123', email: 'test@example.com', role: Role.CLIENT });
      expect(token).toBeDefined();
      
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('CLIENT');
    });
  });

  describe('signRefreshToken', () => {
    it('should create refresh token with user data', () => {
      const token = signRefreshToken('user-123');
      expect(token).toBeDefined();
      
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe('user-123');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = signAccessToken({ userId: 'user-123', email: 'test@example.com', role: Role.CLIENT });
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('CLIENT');
    });

    it('should throw ApiError for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw for refresh token used as access token', () => {
      const refreshToken = signRefreshToken('user-123');
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = signRefreshToken('user-123');
      const decoded = verifyRefreshToken(token);
      
      expect(decoded.userId).toBe('user-123');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should throw for access token used as refresh token', () => {
      const accessToken = signAccessToken({ userId: 'user-123', email: 'test@example.com', role: Role.CLIENT });
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});