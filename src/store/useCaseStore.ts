import { create } from 'zustand';
import type { Case, DecisionModel, FitModel, ProblemForm, RoiModel, SummaryCache } from '@/models/types';
import { calculateRoi, DEFAULT_SCORES, DEFAULT_WEIGHTS } from '@/lib/roi';

const CASES_KEY = 'ai-decision-workspace:cases';
const SNAPSHOTS_KEY = 'ai-decision-workspace:snapshots';
const SNAPSHOT_LIMIT = 10;
const SAVE_DEBOUNCE_MS = 500;

let saveTimer: ReturnType<typeof setTimeout> | null = null;

const getNow = () => new Date().toISOString();

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `case-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const loadCases = (): Case[] => {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(CASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Case[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const loadSnapshots = (): Array<{ timestamp: string; cases: Case[] }> => {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistCases = (cases: Case[]) => {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(CASES_KEY, JSON.stringify(cases));

    const snapshots = loadSnapshots();
    const nextSnapshots = [
      { timestamp: getNow(), cases },
      ...snapshots,
    ].slice(0, SNAPSHOT_LIMIT);

    storage.setItem(SNAPSHOTS_KEY, JSON.stringify(nextSnapshots));
  } catch {
    // Ignore storage errors to keep UI responsive.
  }
};

const schedulePersist = (cases: Case[]) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    persistCases(cases);
  }, SAVE_DEBOUNCE_MS);
};

const createEmptyCase = (): Case => {
  const now = getNow();
  return {
    id: generateId(),
    title: 'New Case',
    createdAt: now,
    updatedAt: now,
    step1: {
      form: {
        problemStatement: '',
        ownerTeam: '',
        scope: 'team',
        costOfInactionType: 'financial',
        baseline: '',
        successMetric: '',
        targetImprovement: '',
      },
      gateStatus: {
        passed: false,
        issues: [],
      },
    },
    currentStep: 1,
  };
};

const seedCase = (): Case => {
  const now = getNow();
  const roi = calculateRoi(DEFAULT_WEIGHTS, DEFAULT_SCORES);

  return {
    id: generateId(),
    title: 'Customer Support Triage / 客服分流',
    createdAt: now,
    updatedAt: now,
    step1: {
      form: {
        problemStatement: '客服工单量激增，导致响应时间延长，客户满意度下降。',
        ownerTeam: 'Customer Support',
        scope: 'department',
        costOfInactionType: 'operational',
        baseline: '平均首响时间 12 小时，满意度 78%。',
        successMetric: '首响时间降低 50%',
        targetImprovement: '将首响时间降低到 6 小时以内。',
      },
      gateStatus: {
        passed: false,
        issues: ['Need numeric success metric with unit'],
      },
    },
    step2a: {
      model: {
        isAiProblem: true,
        aiRole: 'assistant',
        dataReadiness: 'some',
        hitlRequired: true,
        technicalFeasibility: 'medium',
      },
    },
    step2b: {
      model: {
        weights: DEFAULT_WEIGHTS,
        scores: DEFAULT_SCORES,
        totals: roi.totals,
        quadrant: roi.quadrant,
        whyHere: {
          text: '初步判断属于快速胜利区，但需要完善数据流程。',
          confirmed: false,
        },
      },
    },
    currentStep: 1,
  };
};

interface CaseStoreState {
  cases: Case[];
  activeCaseId: string | null;
  createCase: () => Case;
  updateStep1: (caseId: string, form: ProblemForm) => void;
  updateStep2a: (caseId: string, model: FitModel) => void;
  updateStep2b: (caseId: string, model: RoiModel) => void;
  updateStep3: (caseId: string, model: DecisionModel) => void;
  updateStep4: (caseId: string, summary: SummaryCache) => void;
  computeRoi: (caseId: string) => void;
  markGateStatus: (caseId: string, passed: boolean, issues: string[]) => void;
  setActiveCase: (caseId: string) => void;
  listCasesSortedByUpdatedAt: () => Case[];
}

const initializeCases = (): Case[] => {
  const loaded = loadCases();
  if (loaded.length > 0) return loaded;
  const seeded = seedCase();
  persistCases([seeded]);
  return [seeded];
};

export const useCaseStore = create<CaseStoreState>((set, get) => ({
  cases: initializeCases(),
  activeCaseId: null,
  createCase: () => {
    const nextCase = createEmptyCase();
    set(state => {
      const cases = [nextCase, ...state.cases];
      schedulePersist(cases);
      return { cases, activeCaseId: nextCase.id };
    });
    return nextCase;
  },
  updateStep1: (caseId, form) => {
    set(state => {
      const cases = state.cases.map(item =>
        item.id === caseId
          ? {
              ...item,
              updatedAt: getNow(),
              title:
                item.title === 'New Case' && form.problemStatement.trim()
                  ? form.problemStatement.trim().slice(0, 40)
                  : item.title,
              step1: {
                ...item.step1,
                form,
              },
            }
          : item
      );
      schedulePersist(cases);
      return { cases };
    });
  },
  updateStep2a: (caseId, model) => {
    set(state => {
      const cases = state.cases.map(item =>
        item.id === caseId
          ? {
              ...item,
              updatedAt: getNow(),
              step2a: { model },
            }
          : item
      );
      schedulePersist(cases);
      return { cases };
    });
  },
  updateStep2b: (caseId, model) => {
    set(state => {
      const cases = state.cases.map(item =>
        item.id === caseId
          ? {
              ...item,
              updatedAt: getNow(),
              step2b: { model },
            }
          : item
      );
      schedulePersist(cases);
      return { cases };
    });
  },
  updateStep3: (caseId, model) => {
    set(state => {
      const cases = state.cases.map(item =>
        item.id === caseId
          ? {
              ...item,
              updatedAt: getNow(),
              step3: { model },
            }
          : item
      );
      schedulePersist(cases);
      return { cases };
    });
  },
  updateStep4: (caseId, summary) => {
    set(state => {
      const cases = state.cases.map(item =>
        item.id === caseId
          ? {
              ...item,
              updatedAt: getNow(),
              step4: {
                summary,
                lastExportedAt: getNow(),
              },
            }
          : item
      );
      schedulePersist(cases);
      return { cases };
    });
  },
  computeRoi: (caseId) => {
    set(state => {
      const cases = state.cases.map(item => {
        if (item.id !== caseId || !item.step2b) return item;
        const { weights, scores } = item.step2b.model;
        const result = calculateRoi(weights, scores);
        return {
          ...item,
          updatedAt: getNow(),
          step2b: {
            model: {
              ...item.step2b.model,
              totals: result.totals,
              quadrant: result.quadrant,
            },
          },
        };
      });
      schedulePersist(cases);
      return { cases };
    });
  },
  markGateStatus: (caseId, passed, issues) => {
    set(state => {
      const cases = state.cases.map(item =>
        item.id === caseId
          ? {
              ...item,
              updatedAt: getNow(),
              step1: {
                ...item.step1,
                gateStatus: {
                  passed,
                  issues,
                  validatedAt: getNow(),
                },
              },
            }
          : item
      );
      schedulePersist(cases);
      return { cases };
    });
  },
  setActiveCase: (caseId) => {
    set(state => (state.activeCaseId === caseId ? state : { activeCaseId: caseId }));
  },
  listCasesSortedByUpdatedAt: () => {
    return [...get().cases].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  },
}));
