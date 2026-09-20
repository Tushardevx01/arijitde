import { Goal } from '@prisma/client';

/**
 * Scoring constants - centralized configuration for portfolio scoring
 */

export const SCORING_CONSTANTS = {
  // Score bounds
  MIN_DISPLAY_SCORE: 2,
  MAX_DISPLAY_SCORE: 97,
  MAX_DIMENSION_SCORE: 20,
  MAX_TOTAL_SCORE: 100,

  // Tag thresholds
  TAG_THRESHOLDS: {
    ALIGNED: 75,
    MODERATE: 60,
    NEEDS_REVIEW: 0,
  } as const,

  // Special goals that get NEEDS_STRUCTURING tag
  SPECIAL_GOALS: [Goal.EXPLORING, Goal.NOT_SURE_YET] as Goal[],

  // Score scaling for empty portfolios
  EMPTY_PORTFOLIO_MULTIPLIER: 5,

  // Insight limits
  MAX_INSIGHTS: 5,
  MIN_INSIGHTS: 3,

  // Dimension configuration
  DIMENSIONS: [
    { name: 'Goal Alignment', maxScore: 20 },
    { name: 'Asset Allocation', maxScore: 20 },
    { name: 'Diversification', maxScore: 20 },
    { name: 'Discipline', maxScore: 20 },
    { name: 'Efficiency', maxScore: 20 },
  ] as const,

  // General insights (fallback padding)
  GENERAL_INSIGHTS: [
    'Portfolio: Review and rebalance your portfolio annually to maintain your target risk profile',
    'Portfolio: Maintain an emergency fund separate from your market-linked investments',
    'Portfolio: Review your investment goals periodically to account for any lifecycle changes',
    'Portfolio: Stay invested for the long-term to beat inflation',
  ] as const,
} as const;

// Type exports
export type ScoringTag = 'ALIGNED' | 'MODERATE' | 'NEEDS_REVIEW' | 'NEEDS_STRUCTURING';
export type DimensionName = (typeof SCORING_CONSTANTS.DIMENSIONS)[number]['name'];