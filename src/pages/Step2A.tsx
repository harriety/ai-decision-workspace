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
    <div className="step-page">
      <h1>AI Fit Modeling / AI 适配建模</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <BilingualField labelZh="是否是 AI 问题" labelEn="Is this an AI problem?">
          <label>
            <input
              type="radio"
              value="true"
              {...register('isAiProblem', {
                setValueAs: value => (typeof value === 'boolean' ? value : value === 'true'),
              })}
            />
            Yes / 是
          </label>
          <label>
            <input
              type="radio"
              value="false"
              {...register('isAiProblem', {
                setValueAs: value => (typeof value === 'boolean' ? value : value === 'true'),
              })}
            />
            No / 否
          </label>
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

        <BilingualField labelZh="数据准备度" labelEn="Data readiness">
          <select {...register('dataReadiness')}>
            <option value="none">None / 无</option>
            <option value="some">Some / 部分</option>
            <option value="ready">Ready / 充足</option>
            <option value="abundant">Abundant / 丰富</option>
          </select>
        </BilingualField>

        <BilingualField labelZh="是否需要人机协作" labelEn="Human-in-the-loop required">
          <label>
            <input type="checkbox" {...register('hitlRequired')} /> Yes / 是
          </label>
        </BilingualField>

        <BilingualField labelZh="技术可行性" labelEn="Technical feasibility">
          <select {...register('technicalFeasibility')}>
            <option value="low">Low / 低</option>
            <option value="medium">Medium / 中</option>
            <option value="high">High / 高</option>
          </select>
        </BilingualField>

        <BilingualField labelZh="伦理与合规考虑" labelEn="Ethical considerations">
          <textarea
            rows={3}
            placeholder="Comma separated"
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

        <button type="submit" className="primary-button">Save / 保存</button>
      </form>
    </div>
  );
};

export default Step2A;
