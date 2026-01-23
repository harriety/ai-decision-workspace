import type { FitModel, ProblemForm, RoiModel } from '@/models/types';

interface PromptPair {
  systemPrompt: string;
  userPrompt: string;
}

export const buildPage1InterviewPrompt = (form: ProblemForm): PromptPair => {
  return {
    systemPrompt: 'You are an AI facilitator helping clarify business problems. Ask concise questions.',
    userPrompt: `Problem statement: ${form.problemStatement}\nOwner team: ${form.ownerTeam}\nScope: ${form.scope}\nCost of inaction: ${form.costOfInactionType}`,
  };
};

export const buildPage1RewritePrompt = (form: ProblemForm): PromptPair => {
  return {
    systemPrompt: 'Rewrite the problem statement to be specific, measurable, and neutral about solutions.',
    userPrompt: `Original statement: ${form.problemStatement}\nBaseline: ${form.baseline}\nSuccess metric: ${form.successMetric}\nTarget improvement: ${form.targetImprovement}`,
  };
};

export const buildRoiSuggestScoresPrompt = (model: RoiModel): PromptPair => {
  return {
    systemPrompt: 'Suggest ROI scores (0-3) based on weights and context. Keep it brief.',
    userPrompt: `Return weights: ${JSON.stringify(model.weights.returnWeights)}\nInvest weights: ${JSON.stringify(model.weights.investWeights)}\nCurrent scores: ${JSON.stringify(model.scores)}`,
  };
};

export const buildRecommendationPrompt = (
  fit: FitModel | undefined,
  roi: RoiModel | undefined
): PromptPair => {
  return {
    systemPrompt: 'Provide recommendation reasons and counterarguments. Avoid making the final decision.',
    userPrompt: `Fit model: ${JSON.stringify(fit)}\nROI model: ${JSON.stringify(roi)}`,
  };
};
