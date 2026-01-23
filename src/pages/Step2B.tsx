import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import type { QuadrantRationale, RoiModel, RoiScores, RoiWeights } from '@/models/types';
import { ROI_WEIGHT_LABELS } from '@/models/types';
import { useCaseStore } from '@/store/useCaseStore';
import { calculateRoi, calculateWeightPercentages, DEFAULT_SCORES, DEFAULT_WEIGHTS, validateScores, validateWeights } from '@/lib/roi';
import RoiQuadrant from '@/components/RoiQuadrant';
import { generateText } from '@/lib/llm/adapter';
import { buildRoiSuggestScoresPrompt } from '@/lib/llm/prompts';

const RETURN_FIELDS = [
  'costSavings',
  'revenueIncrease',
  'efficiency',
  'customerSatisfaction',
  'quality',
  'riskReduction',
  'capability',
] as const;

const INVEST_FIELDS = ['data', 'engineering', 'change'] as const;

interface RoiFormValues {
  weights: RoiWeights;
  scores: RoiScores;
  whyHere: QuadrantRationale;
}

const Step2B = () => {
  const params = useParams();
  const caseId = params.id || '';
  const caseItem = useCaseStore(state => state.cases.find(item => item.id === caseId));
  const updateStep2b = useCaseStore(state => state.updateStep2b);
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [whyHereError, setWhyHereError] = useState('');

  const defaultValues = useMemo<RoiFormValues>(() => {
    if (caseItem?.step2b?.model) {
      return {
        weights: caseItem.step2b.model.weights,
        scores: caseItem.step2b.model.scores,
        whyHere: caseItem.step2b.model.whyHere,
      };
    }

    return {
      weights: DEFAULT_WEIGHTS,
      scores: DEFAULT_SCORES,
      whyHere: {
        text: '',
        confirmed: false,
      },
    };
  }, [caseItem]);

  const { register, handleSubmit, watch, reset } = useForm<RoiFormValues>({
    defaultValues,
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

  const weights = watch('weights');
  const scores = watch('scores');
  const whyHere = watch('whyHere');

  const weightIssues = validateWeights(weights);
  const scoreIssues = validateScores(scores);
  const weightsValid = weightIssues.length === 0;
  const scoresValid = scoreIssues.length === 0;

  const roiResult = calculateRoi(weights, scores);
  const percentages = calculateWeightPercentages(weights);

  const handleSuggestScores = async () => {
    setSuggestionLoading(true);
    const model: RoiModel = {
      weights,
      scores,
      totals: roiResult.totals,
      quadrant: roiResult.quadrant,
      whyHere,
    };

    try {
      const prompt = buildRoiSuggestScoresPrompt(model);
      const response = await generateText({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
      });
      setSuggestion(response.text);
    } catch {
      setSuggestion('AI suggestion failed. Please try again.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const onSubmit = (data: RoiFormValues) => {
    if (!weightsValid || !scoresValid) {
      setWhyHereError('Complete weights and scores before saving.');
      return;
    }
    if (!data.whyHere.text.trim() || !data.whyHere.confirmed) {
      setWhyHereError('Please confirm the quadrant rationale.');
      return;
    }
    setWhyHereError('');
    const result = calculateRoi(data.weights, data.scores);
    updateStep2b(caseId, {
      weights: data.weights,
      scores: data.scores,
      totals: result.totals,
      quadrant: result.quadrant,
      whyHere: data.whyHere,
      lastCalculatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="step-page">
      <h1>Strategic ROI Lens / ROI 评估</h1>
      <div className="roi-layout">
        <div className="roi-left">
          <details open className="roi-section">
            <summary>Section 1: Set Weights / 权重设置</summary>
            {!weightsValid && (
              <div className="field-error">{weightIssues.join(' ')}</div>
            )}
            <div className="roi-grid">
              <h3>Return Weights / 回报权重</h3>
              {RETURN_FIELDS.map(key => (
                <div key={key} className="roi-row">
                  <label>
                    {ROI_WEIGHT_LABELS.returnWeights[key].zh} / {ROI_WEIGHT_LABELS.returnWeights[key].en}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    {...register(`weights.returnWeights.${key}`, { valueAsNumber: true })}
                  />
                  <div className="roi-value">{weights.returnWeights[key]}</div>
                  <div className="roi-percent">{percentages.returnWeights[key].toFixed(0)}%</div>
                </div>
              ))}
            </div>
            <div className="roi-grid">
              <h3>Investment Weights / 投入权重</h3>
              {INVEST_FIELDS.map(key => (
                <div key={key} className="roi-row">
                  <label>
                    {ROI_WEIGHT_LABELS.investWeights[key].zh} / {ROI_WEIGHT_LABELS.investWeights[key].en}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    {...register(`weights.investWeights.${key}`, { valueAsNumber: true })}
                  />
                  <div className="roi-value">{weights.investWeights[key]}</div>
                  <div className="roi-percent">{percentages.investWeights[key].toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </details>

          <details className="roi-section" open={weightsValid}>
            <summary>Section 2: Score Inputs / 打分</summary>
            {!weightsValid && <div className="field-error">Complete weights first.</div>}
            {weightsValid && !scoresValid && (
              <div className="field-error">{scoreIssues.join(' ')}</div>
            )}
            {weightsValid && (
              <div className="roi-grid">
                <h3>Return Scores / 回报评分</h3>
                {RETURN_FIELDS.map(key => (
                  <div key={key} className="roi-row">
                    <label>
                      {ROI_WEIGHT_LABELS.returnWeights[key].zh} / {ROI_WEIGHT_LABELS.returnWeights[key].en}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      {...register(`scores.returnScores.${key}`, { valueAsNumber: true })}
                    />
                  </div>
                ))}
              </div>
            )}
            {weightsValid && (
              <div className="roi-grid">
                <h3>Investment Scores / 投入评分</h3>
                {INVEST_FIELDS.map(key => (
                  <div key={key} className="roi-row">
                    <label>
                      {ROI_WEIGHT_LABELS.investWeights[key].zh} / {ROI_WEIGHT_LABELS.investWeights[key].en}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      {...register(`scores.investScores.${key}`, { valueAsNumber: true })}
                    />
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={handleSuggestScores} disabled={suggestionLoading || !weightsValid}>
              AI Suggest Scores / AI 建议评分
            </button>
            <textarea rows={6} readOnly value={suggestionLoading ? 'Loading...' : suggestion} />
          </details>

          <details className="roi-section" open={weightsValid && scoresValid}>
            <summary>Section 3: Quadrant & Rationale / 象限与理由</summary>
            {!weightsValid && <div className="field-error">Complete weights first.</div>}
            {weightsValid && !scoresValid && <div className="field-error">Complete scores first.</div>}
            {weightsValid && scoresValid && (
              <div className="roi-grid">
                <label>Why here? / 为什么在此象限</label>
                <textarea rows={4} {...register('whyHere.text')} />
                <label>
                  <input type="checkbox" {...register('whyHere.confirmed')} /> Confirmed by human / 已人工确认
                </label>
                {whyHereError && <span className="field-error">{whyHereError}</span>}
              </div>
            )}
          </details>

          <button type="button" className="primary-button" onClick={handleSubmit(onSubmit)}>
            Save ROI / 保存
          </button>
        </div>

        <aside className="roi-right">
          <div className="roi-panel">
            <h3>ROI Live Panel</h3>
            <div className="roi-metrics">
              <div>Return Total: {roiResult.totals.returnTotalRaw.toFixed(1)}</div>
              <div>Invest Total: {roiResult.totals.investTotalRaw.toFixed(1)}</div>
              <div>Quadrant: {roiResult.quadrant}</div>
            </div>
            <RoiQuadrant x={roiResult.totals.investTotalNorm} y={roiResult.totals.returnTotalNorm} />
            <div className="roi-preview">
              <strong>Why here preview / 理由预览</strong>
              <p>{whyHere.text || 'N/A'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Step2B;
