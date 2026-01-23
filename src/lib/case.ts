import type { Case } from '@/models/types';

export const getCaseTargetStep = (item: Case) => {
  if (!item.step1.gateStatus.passed) return 'step-1';
  if (item.step4) return 'step-4';
  if (item.step3) return 'step-3';
  if (item.step2b) return 'step-2b';
  if (item.step2a) return 'step-2a';
  return 'step-1';
};
