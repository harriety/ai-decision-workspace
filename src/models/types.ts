// ============================================
// Core Types for AI Decision Workspace
// ============================================

/**
 * ROI Weight Groups
 * Weights range from 0 to 5
 */
export interface RoiWeights {
  // Return weights (benefits) - Updated with comprehensive aspects
  returnWeights: {
    costSavings: number;      // 成本节约 - Cost savings
    revenueIncrease: number;  // 收入增长 - Revenue increase
    efficiency: number;       // 效率提升 - Efficiency improvement
    customerSatisfaction: number; // 客户满意度 - Customer satisfaction
    quality: number;          // 质量提升 - Quality enhancement
    riskReduction: number;    // 风险降低 - Risk reduction
    capability: number;       // 能力建设 - Capability building
  };
  
  // Investment weights (costs)
  investWeights: {
    data: number;      // Data preparation
    engineering: number; // Engineering effort
    change: number;    // Change management
  };
}

/**
 * ROI Scores
 * Scores range from 0 to 3
 */
export interface RoiScores {
  // Return scores (benefits) - Updated to match weights
  returnScores: {
    costSavings: number;
    revenueIncrease: number;
    efficiency: number;
    customerSatisfaction: number;
    quality: number;
    riskReduction: number;
    capability: number;
  };
  
  // Investment scores (costs)
  investScores: {
    data: number;
    engineering: number;
    change: number;
  };
}

/**
 * ROI Totals and Quadrant
 */
export interface RoiTotals {
  // Raw totals (weight * score)
  returnTotalRaw: number;
  investTotalRaw: number;
  
  // Maximum possible totals
  maxReturnRaw: number;
  maxInvestRaw: number;
  
  // Normalized totals (0 to 1)
  returnTotalNorm: number;
  investTotalNorm: number;
}

/**
 * ROI Quadrant
 * Based on normalized totals
 */
export type Quadrant = 
  | 'quick-wins'      // Low investment, high return
  | 'strategic-bets'  // High investment, high return
  | 'hygiene'        // Low investment, low return
  | 'experiments';    // High investment, low return

/**
 * Quadrant rationale
 */
export interface QuadrantRationale {
  text: string;
  confirmed: boolean;
}

/**
 * Step 1: Problem Clarification
 */
export interface ProblemForm {
  problemStatement: string;
  ownerTeam: string;
  scope: 'team' | 'department' | 'company' | 'enterprise';
  costOfInactionType: 'financial' | 'competitive' | 'operational' | 'reputational';
  baseline: string;
  successMetric: string;
  targetImprovement: string;
  timelineWeeks?: number;
  stakeholders?: string[];
}

/**
 * Gate validation status
 */
export interface GateStatus {
  passed: boolean;
  issues: string[];
  validatedAt?: string;
}

/**
 * Step 2A: AI Fit Modeling
 */
export interface FitModel {
  isAiProblem: boolean;
  aiRole: 'assistant' | 'automation' | 'analyst' | 'creator' | 'other';
  dataReadiness: 'none' | 'some' | 'ready' | 'abundant';
  hitlRequired: boolean; // Human-in-the-loop required
  ethicalConsiderations?: string[];
  technicalFeasibility: 'low' | 'medium' | 'high';
}

/**
 * Step 2B: ROI Model
 */
export interface RoiModel {
  weights: RoiWeights;
  scores: RoiScores;
  totals: RoiTotals;
  quadrant: Quadrant;
  whyHere: QuadrantRationale;
  lastCalculatedAt?: string;
}

/**
 * Step 3: Recommendation Option
 */
interface RecommendationOption {
  id: string;
  title: string;
  description: string;
  rationale: string;
  counterarguments: string[];
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Step 3: Decision Model
 */
export interface DecisionModel {
  recommendationOptions: RecommendationOption[];
  selectedDecision: string; // ID of selected option
  rationaleText: string;
  nextSteps: string[];
  decisionMadeAt?: string;
}

/**
 * Step 4: Summary
 */
export interface SummaryCache {
  markdown: string;
  json: string;
  generatedAt: string;
}

/**
 * Complete Case Model
 */
export interface Case {
  // Metadata
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  
  // Steps
  step1: {
    form: ProblemForm;
    gateStatus: GateStatus;
  };
  
  step2a?: {
    model: FitModel;
  };
  
  step2b?: {
    model: RoiModel;
  };
  
  step3?: {
    model: DecisionModel;
  };
  
  step4?: {
    summary: SummaryCache;
    lastExportedAt?: string;
  };
  
  // Current state
  currentStep: 1 | 2 | 3 | 4;
  isArchived?: boolean;
  tags?: string[];
}

/**
 * ROI Calculation Result
 */
export interface RoiCalculationResult {
  totals: RoiTotals;
  quadrant: Quadrant;
  quadrantLabel: {
    en: string;
    zh: string;
  };
  quadrantDescription: {
    en: string;
    zh: string;
  };
}

/**
 * Bilingual Text
 */
export interface BilingualText {
  en: string;
  zh: string;
}

/**
 * App Settings
 */
export interface AppSettings {
  language: 'en' | 'zh';
  roiThresholdX: number;
  roiThresholdY: number;
  enableAnalytics: boolean;
  llmProvider: 'mock' | 'openai' | 'gemini' | 'deepseek';
  autoSave: boolean;
}

/**
 * ROI Weight Labels (bilingual)
 */
export const ROI_WEIGHT_LABELS = {
  returnWeights: {
    costSavings: { en: 'Cost Savings', zh: '成本节约' },
    revenueIncrease: { en: 'Revenue Increase', zh: '收入增长' },
    efficiency: { en: 'Efficiency Improvement', zh: '效率提升' },
    customerSatisfaction: { en: 'Customer Satisfaction', zh: '客户满意度' },
    quality: { en: 'Quality Enhancement', zh: '质量提升' },
    riskReduction: { en: 'Risk Reduction', zh: '风险降低' },
    capability: { en: 'Capability Building', zh: '能力建设' },
  },
  investWeights: {
    data: { en: 'Data Preparation', zh: '数据准备' },
    engineering: { en: 'Engineering Effort', zh: '工程投入' },
    change: { en: 'Change Management', zh: '变革管理' },
  },
};

/**
 * ROI Score Descriptions (bilingual)
 */
export const ROI_SCORE_DESCRIPTIONS = {
  0: { en: 'None/Not applicable', zh: '无/不适用' },
  1: { en: 'Low potential/requirement', zh: '低潜力/要求' },
  2: { en: 'Moderate potential/requirement', zh: '中等潜力/要求' },
  3: { en: 'High potential/requirement', zh: '高潜力/要求' },
};
