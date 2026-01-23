import type { Case } from '@/models/types';

export const toMarkdown = (decisionCase: Case): string => {
  const { step1, step2a, step2b, step3 } = decisionCase;

  return `# AI Decision Summary / 决策摘要\n\n## Case / 案例\n- Title / 标题: ${decisionCase.title}\n- Updated / 更新时间: ${decisionCase.updatedAt}\n\n## Problem Statement / 问题陈述\n${step1.form.problemStatement}\n\n## Baseline / 现状\n${step1.form.baseline}\n\n## Success Metric / 成功指标\n${step1.form.successMetric}\n\n## Target Improvement / 目标改进\n${step1.form.targetImprovement}\n\n## AI Fit / AI 适配\n${step2a ? JSON.stringify(step2a.model, null, 2) : 'N/A'}\n\n## ROI / ROI\n${step2b ? JSON.stringify(step2b.model, null, 2) : 'N/A'}\n\n## Decision / 决策\n${step3 ? JSON.stringify(step3.model, null, 2) : 'N/A'}\n`;
};

export const toJson = (decisionCase: Case): string => {
  return JSON.stringify(decisionCase, null, 2);
};
