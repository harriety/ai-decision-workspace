import { z } from 'zod';

// ============================================
// Helper Schemas
// ============================================

export const numberRange = (min: number, max: number) => 
  z.number().min(min).max(max);

export const bilingualTextSchema = z.object({
  en: z.string().min(1),
  zh: z.string().min(1),
});

// ============================================
// ROI Schemas
// ============================================

export const roiWeightsSchema = z.object({
  returnWeights: z.object({
    costSavings: numberRange(0, 5),
    revenueIncrease: numberRange(0, 5),
    efficiency: numberRange(0, 5),
    customerSatisfaction: numberRange(0, 5),
    quality: numberRange(0, 5),
    riskReduction: numberRange(0, 5),
    capability: numberRange(0, 5),
  }),
  investWeights: z.object({
    data: numberRange(0, 5),
    engineering: numberRange(0, 5),
    change: numberRange(0, 5),
  }),
});

export const roiScoresSchema = z.object({
  returnScores: z.object({
    costSavings: numberRange(0, 3),
    revenueIncrease: numberRange(0, 3),
    efficiency: numberRange(0, 3),
    customerSatisfaction: numberRange(0, 3),
    quality: numberRange(0, 3),
    riskReduction: numberRange(0, 3),
    capability: numberRange(0, 3),
  }),
  investScores: z.object({
    data: numberRange(0, 3),
    engineering: numberRange(0, 3),
    change: numberRange(0, 3),
  }),
});

export const quadrantSchema = z.enum([
  'quick-wins',
  'strategic-bets', 
  'hygiene',
  'experiments'
]);

export const quadrantRationaleSchema = z.object({
  text: z.string().min(10).max(500),
  confirmed: z.boolean().default(false),
});

// ============================================
// Step 1: Problem Clarification
// ============================================

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    value => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = typeof value === 'number' ? value : Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z.number().min(min).max(max).optional()
  );

export const problemFormSchema = z.object({
  problemStatement: z.string()
    .min(parseInt(import.meta.env.VITE_MIN_PROBLEM_LENGTH || '15'), 
      'Problem statement is too short')
    .max(parseInt(import.meta.env.VITE_MAX_PROBLEM_LENGTH || '1000'), 
      'Problem statement is too long'),
  
  ownerTeam: z.string().min(2, 'Team name is required'),
  
  scope: z.enum(['team', 'department', 'company', 'enterprise']),
  
  costOfInactionType: z.enum([
    'financial', 
    'competitive', 
    'operational', 
    'reputational'
  ]),
  
  baseline: z.string().min(10, 'Baseline description is required'),
  
  successMetric: z.string().min(10, 'Success metric is required'),
  
  targetImprovement: z.string().min(10, 'Target improvement is required'),
  
  timelineWeeks: optionalNumber(1, 104),
  
  stakeholders: z.array(z.string()).optional(),
});

// ============================================
// Quality Gate Validation Rules
// ============================================

// Solution-leading phrases that should be rejected
const SOLUTION_LEADING_PHRASES = [
  // Chinese phrases
  '用LLM', '用AI', '自动化', 'agent', 'RAG', '大模型',
  '构建', '开发', '实现', '搭建', '创建',
  
  // English phrases
  'use LLM', 'use AI', 'automate', 'build', 'implement',
  'develop', 'create', 'set up', 'deploy',
];

// Too generic keywords
const GENERIC_KEYWORDS = [
  '提升效率', '数字化转型', '优化流程', '提高质量',
  'improve efficiency', 'digital transformation', 
  'optimize process', 'enhance quality',
];

/**
 * Validate problem statement quality
 */
export const validateProblemStatement = (
  problemStatement: string
): string[] => {
  const issues: string[] = [];
  const lowerCaseStatement = problemStatement.toLowerCase();
  
  // Check for solution-leading phrases
  SOLUTION_LEADING_PHRASES.forEach(phrase => {
    if (lowerCaseStatement.includes(phrase.toLowerCase())) {
      issues.push(`Avoid solution-leading phrases like "${phrase}"`);
    }
  });
  
  // Check if too generic
  const hasGenericKeywords = GENERIC_KEYWORDS.some(keyword => 
    lowerCaseStatement.includes(keyword.toLowerCase())
  );
  
  if (problemStatement.length < 15) {
    issues.push('Problem statement is too short');
  }

  if (hasGenericKeywords) {
    const stripped = GENERIC_KEYWORDS.reduce((acc, keyword) => {
      return acc.replace(new RegExp(keyword, 'ig'), '');
    }, lowerCaseStatement);

    const remaining = stripped.replace(/[^a-z0-9\u4e00-\u9fff]/gi, '');
    if (remaining.length < 6) {
      issues.push('Problem statement is too generic');
    }
  }
  
  // Check success metric for numbers/units
  // This will be called separately with the success metric
  
  return issues;
};

/**
 * Validate success metric
 */
export const validateSuccessMetric = (metric: string): string[] => {
  const issues: string[] = [];
  
  // Check for numbers or percentages
  const hasNumbers = /\d+/.test(metric);
  const hasUnits = /%|\$|hours|days|weeks|months|users|customers/i.test(metric);
  
  if (!hasNumbers || !hasUnits) {
    issues.push('Success metric should include numbers and units (e.g., "increase by 20%" or "reduce by 5 hours")');
  }
  
  return issues;
};

/**
 * Complete gate validation
 */
export const validateGate = (
  formData: z.infer<typeof problemFormSchema>
): string[] => {
  const issues = [
    ...validateProblemStatement(formData.problemStatement),
    ...validateSuccessMetric(formData.successMetric),
  ];
  
  return issues;
};

// ============================================
// Step 2A: AI Fit Modeling
// ============================================

export const fitModelSchema = z.object({
  isAiProblem: z.boolean(),
  aiRole: z.enum(['assistant', 'automation', 'analyst', 'creator', 'other']),
  dataReadiness: z.enum(['none', 'some', 'ready', 'abundant']),
  hitlRequired: z.boolean(),
  ethicalConsiderations: z.array(z.string()).optional(),
  technicalFeasibility: z.enum(['low', 'medium', 'high']),
});

// ============================================
// Step 3: Decision Model
// ============================================

export const recommendationOptionSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  description: z.string().min(20),
  rationale: z.string().min(20),
  counterarguments: z.array(z.string()),
  confidence: z.enum(['low', 'medium', 'high']),
});

export const decisionModelSchema = z.object({
  recommendationOptions: z.array(recommendationOptionSchema).min(2),
  selectedDecision: z.string().min(1, 'Select a decision'),
  rationaleText: z.string().min(20),
  nextSteps: z.array(z.string()).min(1),
  decisionMadeAt: z.string().optional(),
});

// ============================================
// Complete Case Schema
// ============================================

export const caseSchema = z.object({
  id: z.string(),
  title: z.string().min(5),
  createdAt: z.string(),
  updatedAt: z.string(),
  
  step1: z.object({
    form: problemFormSchema,
    gateStatus: z.object({
      passed: z.boolean(),
      issues: z.array(z.string()),
      validatedAt: z.string().optional(),
    }),
  }),
  
  step2a: z.object({
    model: fitModelSchema,
  }).optional(),
  
  step2b: z.object({
    model: z.object({
      weights: roiWeightsSchema,
      scores: roiScoresSchema,
      totals: z.object({
        returnTotalRaw: z.number(),
        investTotalRaw: z.number(),
        maxReturnRaw: z.number(),
        maxInvestRaw: z.number(),
        returnTotalNorm: z.number(),
        investTotalNorm: z.number(),
      }),
      quadrant: quadrantSchema,
      whyHere: quadrantRationaleSchema,
      lastCalculatedAt: z.string().optional(),
    }),
  }).optional(),
  
  step3: z.object({
    model: decisionModelSchema,
  }).optional(),
  
  step4: z.object({
    summary: z.object({
      markdown: z.string(),
      json: z.string(),
      generatedAt: z.string(),
    }),
    lastExportedAt: z.string().optional(),
  }).optional(),
  
  currentStep: z.number().min(1).max(4),
  isArchived: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================
// Type Exports
// ============================================

export type ProblemForm = z.infer<typeof problemFormSchema>;
export type FitModel = z.infer<typeof fitModelSchema>;
export type RoiWeights = z.infer<typeof roiWeightsSchema>;
export type RoiScores = z.infer<typeof roiScoresSchema>;
export type Quadrant = z.infer<typeof quadrantSchema>;
export type QuadrantRationale = z.infer<typeof quadrantRationaleSchema>;
export type RecommendationOption = z.infer<typeof recommendationOptionSchema>;
export type DecisionModel = z.infer<typeof decisionModelSchema>;
export type Case = z.infer<typeof caseSchema>;
