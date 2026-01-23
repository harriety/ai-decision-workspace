import { 
  RoiWeights, 
  RoiScores, 
  RoiCalculationResult,
  Quadrant,
  BilingualText
} from '@/models/types';

// ============================================
// Configuration
// ============================================

const CONFIG = {
  // Thresholds for quadrant mapping (0 to 1)
  THRESHOLD_X: parseFloat(import.meta.env.VITE_ROI_THRESHOLD_X || '0.5'),
  THRESHOLD_Y: parseFloat(import.meta.env.VITE_ROI_THRESHOLD_Y || '0.5'),
  
  // Weight and score ranges
  WEIGHT_MIN: 0,
  WEIGHT_MAX: 5,
  SCORE_MIN: 0,
  SCORE_MAX: 3,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate maximum possible raw total for return weights
 */
export const calculateMaxReturnRaw = (weights: RoiWeights['returnWeights']): number => {
  const weightValues = Object.values(weights);
  const maxScore = CONFIG.SCORE_MAX;
  return weightValues.reduce((sum, weight) => sum + (weight * maxScore), 0);
};

/**
 * Calculate maximum possible raw total for investment weights
 */
export const calculateMaxInvestRaw = (weights: RoiWeights['investWeights']): number => {
  const weightValues = Object.values(weights);
  const maxScore = CONFIG.SCORE_MAX;
  return weightValues.reduce((sum, weight) => sum + (weight * maxScore), 0);
};

/**
 * Calculate raw total for return (benefits)
 */
export const calculateReturnTotalRaw = (
  weights: RoiWeights['returnWeights'],
  scores: RoiScores['returnScores']
): number => {
  const weightEntries = Object.entries(weights);
  return weightEntries.reduce((total, [key, weight]) => {
    const score = scores[key as keyof typeof scores];
    return total + (weight * score);
  }, 0);
};

/**
 * Calculate raw total for investment (costs)
 */
export const calculateInvestTotalRaw = (
  weights: RoiWeights['investWeights'],
  scores: RoiScores['investScores']
): number => {
  const weightEntries = Object.entries(weights);
  return weightEntries.reduce((total, [key, weight]) => {
    const score = scores[key as keyof typeof scores];
    return total + (weight * score);
  }, 0);
};

/**
 * Normalize a value to 0-1 range
 */
export const normalizeValue = (
  value: number, 
  maxValue: number
): number => {
  if (maxValue === 0) return 0;
  return Math.min(Math.max(value / maxValue, 0), 1);
};

// ============================================
// Quadrant Mapping
// ============================================

/**
 * Determine quadrant based on normalized values
 */
export const determineQuadrant = (
  investNorm: number,
  returnNorm: number
): Quadrant => {
  const isHighInvestment = investNorm >= CONFIG.THRESHOLD_X;
  const isHighReturn = returnNorm >= CONFIG.THRESHOLD_Y;
  
  if (!isHighInvestment && isHighReturn) {
    return 'quick-wins';
  } else if (isHighInvestment && isHighReturn) {
    return 'strategic-bets';
  } else if (!isHighInvestment && !isHighReturn) {
    return 'hygiene';
  } else {
    return 'experiments';
  }
};

/**
 * Get quadrant label (bilingual)
 */
export const getQuadrantLabel = (quadrant: Quadrant): BilingualText => {
  const labels: Record<Quadrant, BilingualText> = {
    'quick-wins': {
      en: 'Quick Wins',
      zh: '快速胜利',
    },
    'strategic-bets': {
      en: 'Strategic Bets',
      zh: '战略押注',
    },
    'hygiene': {
      en: 'Hygiene / Tactical',
      zh: '基础维护 / 战术性',
    },
    'experiments': {
      en: 'Experiments / Optional',
      zh: '实验性 / 可选',
    },
  };
  
  return labels[quadrant];
};

/**
 * Get quadrant description (bilingual)
 */
export const getQuadrantDescription = (quadrant: Quadrant): BilingualText => {
  const descriptions: Record<Quadrant, BilingualText> = {
    'quick-wins': {
      en: 'Low investment, high return. Prioritize these initiatives for immediate impact.',
      zh: '低投入，高回报。优先考虑这些举措以获得即时影响。',
    },
    'strategic-bets': {
      en: 'High investment, high return. These are long-term strategic initiatives that require significant resources but offer substantial rewards.',
      zh: '高投入，高回报。这些是长期战略举措，需要大量资源但提供丰厚回报。',
    },
    'hygiene': {
      en: 'Low investment, low return. Necessary maintenance or tactical improvements that keep the business running smoothly.',
      zh: '低投入，低回报。必要的维护或战术改进，确保业务平稳运行。',
    },
    'experiments': {
      en: 'High investment, low return. Experimental projects or optional initiatives that may provide learning but limited immediate value.',
      zh: '高投入，低回报。实验性项目或可选举措，可能提供学习机会但即时价值有限。',
    },
  };
  
  return descriptions[quadrant];
};

/**
 * Generate rationale text for quadrant
 */
export const generateQuadrantRationale = (
  quadrant: Quadrant,
  investNorm: number,
  returnNorm: number
): string => {
  const labels = getQuadrantLabel(quadrant);
  const descriptions = getQuadrantDescription(quadrant);
  
  return `This initiative falls in the ${labels.en} quadrant (${labels.zh}). 
Investment level: ${(investNorm * 100).toFixed(0)}% (normalized). 
Return level: ${(returnNorm * 100).toFixed(0)}% (normalized). 

${descriptions.en}

${descriptions.zh}`;
};

// ============================================
// Main Calculation Function
// ============================================

/**
 * Calculate complete ROI analysis
 */
export const calculateRoi = (
  weights: RoiWeights,
  scores: RoiScores
): RoiCalculationResult => {
  // Calculate raw totals
  const returnTotalRaw = calculateReturnTotalRaw(weights.returnWeights, scores.returnScores);
  const investTotalRaw = calculateInvestTotalRaw(weights.investWeights, scores.investScores);
  
  // Calculate maximum possible totals
  const maxReturnRaw = calculateMaxReturnRaw(weights.returnWeights);
  const maxInvestRaw = calculateMaxInvestRaw(weights.investWeights);
  
  // Normalize totals
  const returnTotalNorm = normalizeValue(returnTotalRaw, maxReturnRaw);
  const investTotalNorm = normalizeValue(investTotalRaw, maxInvestRaw);
  
  // Determine quadrant
  const quadrant = determineQuadrant(investTotalNorm, returnTotalNorm);
  const quadrantLabel = getQuadrantLabel(quadrant);
  const quadrantDescription = getQuadrantDescription(quadrant);
  
  return {
    totals: {
      returnTotalRaw,
      investTotalRaw,
      maxReturnRaw,
      maxInvestRaw,
      returnTotalNorm,
      investTotalNorm,
    },
    quadrant,
    quadrantLabel,
    quadrantDescription,
  };
};

// ============================================
// Validation Functions
// ============================================

/**
 * Check if at least one weight is non-zero in each group
 */
export const validateWeights = (weights: RoiWeights): string[] => {
  const issues: string[] = [];
  
  // Check return weights
  const returnWeightValues = Object.values(weights.returnWeights);
  const hasReturnWeights = returnWeightValues.some(w => w > 0);
  if (!hasReturnWeights) {
    issues.push('At least one return weight must be greater than 0');
  }
  
  // Check investment weights
  const investWeightValues = Object.values(weights.investWeights);
  const hasInvestWeights = investWeightValues.some(w => w > 0);
  if (!hasInvestWeights) {
    issues.push('At least one investment weight must be greater than 0');
  }
  
  return issues;
};

/**
 * Check if all scores are within valid range
 */
export const validateScores = (scores: RoiScores): string[] => {
  const issues: string[] = [];
  
  // Check return scores
  Object.entries(scores.returnScores).forEach(([key, score]) => {
    if (score < CONFIG.SCORE_MIN || score > CONFIG.SCORE_MAX) {
      issues.push(`Return score for ${key} must be between ${CONFIG.SCORE_MIN} and ${CONFIG.SCORE_MAX}`);
    }
  });
  
  // Check investment scores
  Object.entries(scores.investScores).forEach(([key, score]) => {
    if (score < CONFIG.SCORE_MIN || score > CONFIG.SCORE_MAX) {
      issues.push(`Investment score for ${key} must be between ${CONFIG.SCORE_MIN} and ${CONFIG.SCORE_MAX}`);
    }
  });
  
  return issues;
};

// ============================================
// Default Values
// ============================================

/**
 * Default ROI weights (balanced)
 */
export const DEFAULT_WEIGHTS: RoiWeights = {
  returnWeights: {
    costSavings: 3,
    revenueIncrease: 4,
    efficiency: 4,
    customerSatisfaction: 3,
    quality: 3,
    riskReduction: 2,
    capability: 3,
  },
  investWeights: {
    data: 4,
    engineering: 5,
    change: 3,
  },
};

/**
 * Default ROI scores (neutral)
 */
export const DEFAULT_SCORES: RoiScores = {
  returnScores: {
    costSavings: 1,
    revenueIncrease: 1,
    efficiency: 1,
    customerSatisfaction: 1,
    quality: 1,
    riskReduction: 1,
    capability: 1,
  },
  investScores: {
    data: 1,
    engineering: 1,
    change: 1,
  },
};

/**
 * Calculate weight percentages for display
 */
export const calculateWeightPercentages = (weights: RoiWeights) => {
  const returnTotal = Object.values(weights.returnWeights).reduce((a, b) => a + b, 0);
  const investTotal = Object.values(weights.investWeights).reduce((a, b) => a + b, 0);
  
  return {
    returnWeights: Object.fromEntries(
      Object.entries(weights.returnWeights).map(([key, value]) => [
        key,
        returnTotal > 0 ? (value / returnTotal) * 100 : 0
      ])
    ) as Record<keyof RoiWeights['returnWeights'], number>,
    investWeights: Object.fromEntries(
      Object.entries(weights.investWeights).map(([key, value]) => [
        key,
        investTotal > 0 ? (value / investTotal) * 100 : 0
      ])
    ) as Record<keyof RoiWeights['investWeights'], number>,
  };
};