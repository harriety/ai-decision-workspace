import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { decisionModelSchema } from '@/models/schemas';
import type { DecisionModel } from '@/models/types';
import { useCaseStore } from '@/store/useCaseStore';
import { generateText } from '@/lib/llm/adapter';
import { buildRecommendationPrompt } from '@/lib/llm/prompts';

const Step3 = () => {
  const params = useParams();
  const caseId = params.id || '';
  const caseItem = useCaseStore(state => state.cases.find(item => item.id === caseId));
  const updateStep3 = useCaseStore(state => state.updateStep3);
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const defaultValues = useMemo<DecisionModel>(() => {
    return (
      caseItem?.step3?.model || {
        recommendationOptions: [
          {
            id: 'option-a',
            title: 'Option A',
            description: '',
            rationale: '',
            counterarguments: [],
            confidence: 'medium',
          },
          {
            id: 'option-b',
            title: 'Option B',
            description: '',
            rationale: '',
            counterarguments: [],
            confidence: 'medium',
          },
        ],
        selectedDecision: '',
        rationaleText: '',
        nextSteps: [],
      }
    );
  }, [caseItem]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DecisionModel>({
    defaultValues,
    resolver: zodResolver(decisionModelSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  if (!caseItem) {
    return <div>Case not found.</div>;
  }

  if (!caseItem.step1.gateStatus.passed) {
    return <div>Please complete Step 1 first.</div>;
  }

  const handleGenerate = async () => {
    setAiLoading(true);
    try {
      const prompt = buildRecommendationPrompt(caseItem.step2a?.model, caseItem.step2b?.model);
      const response = await generateText({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
      });
      setAiOutput(response.text);
    } catch {
      setAiOutput('AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = (data: DecisionModel) => {
    updateStep3(caseId, {
      ...data,
      decisionMadeAt: new Date().toISOString(),
    });
  };

  return (
    <div className="step-page">
      <h1>Recommendations & Decision / 推荐与决策</h1>

      <section className="ai-helper">
        <h2>AI Recommendation / AI 推荐</h2>
        <button type="button" onClick={handleGenerate} disabled={aiLoading}>
          Generate Reasons & Counterarguments / 生成理由与反驳
        </button>
        <textarea rows={8} readOnly value={aiLoading ? 'Loading...' : aiOutput} />
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        {defaultValues.recommendationOptions.map((option, index) => (
          <div key={option.id} className="option-card">
            <h3>Option {index + 1}</h3>
            <label>
              Title
              <input type="text" {...register(`recommendationOptions.${index}.title`)} />
            </label>
            <label>
              Description
              <textarea rows={2} {...register(`recommendationOptions.${index}.description`)} />
            </label>
            <label>
              Rationale
              <textarea rows={2} {...register(`recommendationOptions.${index}.rationale`)} />
            </label>
            <label>
              Counterarguments (one per line)
              <textarea
                rows={2}
                {...register(`recommendationOptions.${index}.counterarguments`, {
                  setValueAs: value => {
                    if (Array.isArray(value)) return value;
                    if (typeof value !== 'string') return [];
                    const trimmed = value.trim();
                    if (!trimmed) return [];
                    return trimmed
                      .split('\n')
                      .map((item: string) => item.trim())
                      .filter(Boolean);
                  },
                })}
              />
            </label>
            <label>
              Confidence
              <select {...register(`recommendationOptions.${index}.confidence`)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              <input type="radio" value={option.id} {...register('selectedDecision')} /> Select this option
            </label>
          </div>
        ))}

        {errors.recommendationOptions && (
          <span className="field-error">Please complete at least two recommendation options.</span>
        )}
        {errors.selectedDecision && (
          <span className="field-error">{errors.selectedDecision.message}</span>
        )}

        <label>
          Final rationale (required)
          <textarea rows={3} {...register('rationaleText')} />
          {errors.rationaleText && <span className="field-error">{errors.rationaleText.message}</span>}
        </label>

        <label>
          Next steps (one per line)
          <textarea
            rows={3}
            {...register('nextSteps', {
              setValueAs: value => {
                if (Array.isArray(value)) return value;
                if (typeof value !== 'string') return [];
                const trimmed = value.trim();
                if (!trimmed) return [];
                return trimmed
                  .split('\n')
                  .map((item: string) => item.trim())
                  .filter(Boolean);
              },
            })}
          />
          {errors.nextSteps && <span className="field-error">{errors.nextSteps.message}</span>}
        </label>

        <button type="submit" className="primary-button">Save Decision / 保存决策</button>
      </form>
    </div>
  );
};

export default Step3;
