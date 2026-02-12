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
    watch,
  } = useForm<DecisionModel>({
    defaultValues,
    resolver: zodResolver(decisionModelSchema),
  });
  const watchedOptions = watch('recommendationOptions');

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
      setAiOutput('AI generation failed. / AI 生成失败。');
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

  const getConfidenceLabel = (confidence: 'low' | 'medium' | 'high') => {
    if (confidence === 'high') return 'High / 高';
    if (confidence === 'low') return 'Low / 低';
    return 'Medium / 中';
  };

  return (
    <div className="step-page step3-page">
      <header className="step3-header">
        <p className="step-kicker">Step 3</p>
        <h1>Recommendations & Decision / 推荐与决策</h1>
        <p className="step-subtitle">
          Use AI for structured arguments, then make the final human decision.
          <br />
          用 AI 生成结构化论证，再由人做最终决策。
        </p>
      </header>

      <section className="ai-helper step3-ai-panel">
        <div className="section-header-row">
          <div>
            <h2>AI Recommendation / AI 推荐</h2>
            <p className="section-subtext">
              Output includes both Chinese and English sections.
              <br />
              输出同时包含中文和英文。
            </p>
          </div>
          <button type="button" className="primary-button" onClick={handleGenerate} disabled={aiLoading}>
            Generate Reasons & Counterarguments / 生成理由与反驳
          </button>
        </div>
        <div className="ai-output-card" role="status" aria-live="polite">
          {aiLoading
            ? 'Loading... / 正在生成...'
            : aiOutput ||
              'Click "Generate Reasons & Counterarguments" to create a bilingual recommendation.\n点击“生成理由与反驳”以生成中英双语推荐。'}
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid step3-form">
        <div className="step3-options-grid">
          {defaultValues.recommendationOptions.map((option, index) => {
            const confidence = watchedOptions?.[index]?.confidence || option.confidence;
            return (
              <article key={option.id} className="option-card step3-option-card">
                <div className="option-card-head">
                  <h3>Option {index + 1}</h3>
                  <span className={`confidence-pill confidence-${confidence}`}>
                    {getConfidenceLabel(confidence)}
                  </span>
                </div>

                <label className="field-block">
                  <span className="field-label">Title / 标题</span>
                  <input type="text" {...register(`recommendationOptions.${index}.title`)} />
                </label>

                <label className="field-block">
                  <span className="field-label">Description / 描述</span>
                  <textarea rows={2} {...register(`recommendationOptions.${index}.description`)} />
                </label>

                <label className="field-block">
                  <span className="field-label">Rationale / 理由</span>
                  <textarea rows={2} {...register(`recommendationOptions.${index}.rationale`)} />
                </label>

                <label className="field-block">
                  <span className="field-label">Counterarguments (one per line) / 反方观点（每行一条）</span>
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

                <label className="field-block">
                  <span className="field-label">Confidence / 置信度</span>
                  <select {...register(`recommendationOptions.${index}.confidence`)}>
                    <option value="low">Low / 低</option>
                    <option value="medium">Medium / 中</option>
                    <option value="high">High / 高</option>
                  </select>
                </label>

                <label className="select-option-row">
                  <input type="radio" value={option.id} {...register('selectedDecision')} />
                  <span>Select this option / 选择该方案</span>
                </label>
              </article>
            );
          })}
        </div>

        {errors.recommendationOptions && (
          <span className="field-error">Please complete at least two recommendation options.</span>
        )}
        {errors.selectedDecision && (
          <span className="field-error">{errors.selectedDecision.message}</span>
        )}

        <section className="step3-decision-panel">
          <h3>Decision Notes / 决策记录</h3>
          <label className="field-block">
            <span className="field-label">Final rationale (required) / 最终理由（必填）</span>
            <textarea rows={3} {...register('rationaleText')} />
            {errors.rationaleText && <span className="field-error">{errors.rationaleText.message}</span>}
          </label>

          <label className="field-block">
            <span className="field-label">Next steps (one per line) / 下一步（每行一条）</span>
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
        </section>

        <button type="submit" className="primary-button">Save Decision / 保存决策</button>
      </form>
    </div>
  );
};

export default Step3;
