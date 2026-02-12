import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { fitModelSchema } from '@/models/schemas';
import type { FitModel } from '@/models/types';
import { useCaseStore } from '@/store/useCaseStore';
import BilingualField from '@/components/BilingualField';

const Step2A = () => {
  const params = useParams();
  const caseId = params.id || '';
  const caseItem = useCaseStore(state => state.cases.find(item => item.id === caseId));
  const updateStep2a = useCaseStore(state => state.updateStep2a);

  const defaultValues = useMemo<FitModel>(() => {
    return (
      caseItem?.step2a?.model || {
        isAiProblem: false,
        aiRole: 'assistant',
        dataReadiness: 'none',
        hitlRequired: true,
        technicalFeasibility: 'medium',
      }
    );
  }, [caseItem]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FitModel>({
    defaultValues,
    resolver: zodResolver(fitModelSchema),
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

  const onSubmit = (data: FitModel) => {
    updateStep2a(caseId, data);
  };

  return (
    <div className="step-page step2a-page">
      <header className="step3-header">
        <p className="step-kicker">Step 2A</p>
        <h1>AI Fit Modeling / AI 适配建模</h1>
        <p className="step-subtitle">
          Decide whether AI is appropriate before ROI scoring.
          <br />
          在 ROI 评分前先判断是否适合用 AI。
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <section className="step-panel">
          <div className="step-panel-head">
            <h2>Fit Check / 适配判断</h2>
            <p>Assess if this is truly an AI-amenable problem.</p>
          </div>
          <div className="step-panel-grid">
            <BilingualField labelZh="是否是 AI 问题" labelEn="Is this an AI problem?">
              <div className="radio-grid two">
                <label className="select-option-row">
                  <input
                    type="radio"
                    value="true"
                    {...register('isAiProblem', {
                      setValueAs: value => (typeof value === 'boolean' ? value : value === 'true'),
                    })}
                  />
                  <span>Yes / 是</span>
                </label>
                <label className="select-option-row">
                  <input
                    type="radio"
                    value="false"
                    {...register('isAiProblem', {
                      setValueAs: value => (typeof value === 'boolean' ? value : value === 'true'),
                    })}
                  />
                  <span>No / 否</span>
                </label>
              </div>
              {errors.isAiProblem && <span className="field-error">{errors.isAiProblem.message}</span>}
            </BilingualField>

            <BilingualField labelZh="AI 角色" labelEn="AI role">
              <select {...register('aiRole')}>
                <option value="assistant">Assistant / 助手</option>
                <option value="automation">Automation / 自动化</option>
                <option value="analyst">Analyst / 分析</option>
                <option value="creator">Creator / 创作</option>
                <option value="other">Other / 其他</option>
              </select>
            </BilingualField>
          </div>
        </section>

        <section className="step-panel">
          <div className="step-panel-head">
            <h2>Delivery Conditions / 实施条件</h2>
            <p>Evaluate data readiness, feasibility and HITL requirements.</p>
          </div>
          <div className="step-panel-grid two-col">
            <BilingualField labelZh="数据准备度" labelEn="Data readiness">
              <select {...register('dataReadiness')}>
                <option value="none">None / 无</option>
                <option value="some">Some / 部分</option>
                <option value="ready">Ready / 充足</option>
                <option value="abundant">Abundant / 丰富</option>
              </select>
            </BilingualField>

            <BilingualField labelZh="技术可行性" labelEn="Technical feasibility">
              <select {...register('technicalFeasibility')}>
                <option value="low">Low / 低</option>
                <option value="medium">Medium / 中</option>
                <option value="high">High / 高</option>
              </select>
            </BilingualField>

            <BilingualField labelZh="是否需要人机协作" labelEn="Human-in-the-loop required">
              <label className="select-option-row">
                <input type="checkbox" {...register('hitlRequired')} />
                <span>Yes / 是</span>
              </label>
            </BilingualField>
          </div>
        </section>

        <section className="step-panel">
          <div className="step-panel-head">
            <h2>Risk Notes / 风险备注</h2>
            <p>List ethical and compliance concerns (comma separated).</p>
          </div>
          <BilingualField labelZh="伦理与合规考虑" labelEn="Ethical considerations">
            <textarea
              rows={3}
              placeholder="Bias, privacy, explainability..."
              {...register('ethicalConsiderations', {
                setValueAs: value => {
                  if (Array.isArray(value)) return value;
                  if (typeof value !== 'string') return undefined;
                  const trimmed = value.trim();
                  if (!trimmed) return undefined;
                  return trimmed
                    .split(',')
                    .map((item: string) => item.trim())
                    .filter(Boolean);
                },
              })}
            />
          </BilingualField>
        </section>

        <button type="submit" className="primary-button">Save / 保存</button>
      </form>
    </div>
  );
};

export default Step2A;
