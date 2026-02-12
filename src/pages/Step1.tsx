import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { problemFormSchema, validateGate } from '@/models/schemas';
import type { ProblemForm } from '@/models/types';
import { useCaseStore } from '@/store/useCaseStore';
import GateStatus from '@/components/GateStatus';
import BilingualField from '@/components/BilingualField';
import { generateText } from '@/lib/llm/adapter';
import { buildPage1InterviewPrompt, buildPage1RewritePrompt } from '@/lib/llm/prompts';

const Step1 = () => {
  const params = useParams();
  const caseId = params.id || '';
  const caseItem = useCaseStore(state => state.cases.find(item => item.id === caseId));
  const updateStep1 = useCaseStore(state => state.updateStep1);
  const markGateStatus = useCaseStore(state => state.markGateStatus);
  const [helperOutput, setHelperOutput] = useState('');
  const [helperLoading, setHelperLoading] = useState(false);

  const defaultValues = useMemo<ProblemForm>(() => {
    return (
      caseItem?.step1.form || {
        problemStatement: '',
        ownerTeam: '',
        scope: 'team',
        costOfInactionType: 'financial',
        baseline: '',
        successMetric: '',
        targetImprovement: '',
      }
    );
  }, [caseItem]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<ProblemForm>({
    defaultValues,
    resolver: zodResolver(problemFormSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  if (!caseItem) {
    return <div>Case not found.</div>;
  }

  const runHelper = async (mode: 'interview' | 'rewrite') => {
    setHelperLoading(true);
    const values = getValues();
    const prompt =
      mode === 'interview'
        ? buildPage1InterviewPrompt(values)
        : buildPage1RewritePrompt(values);

    try {
      const response = await generateText({
        systemPrompt: prompt.systemPrompt,
        userPrompt: prompt.userPrompt,
      });
      setHelperOutput(response.text);
    } catch {
      setHelperOutput('AI helper failed. Please try again.');
    } finally {
      setHelperLoading(false);
    }
  };

  const onSubmit = (data: ProblemForm) => {
    updateStep1(caseId, data);
    const issues = validateGate(data);
    markGateStatus(caseId, issues.length === 0, issues);
  };

  return (
    <div className="step-page step1-page">
      <header className="step3-header">
        <p className="step-kicker">Step 1</p>
        <h1>Problem Clarification / 问题澄清</h1>
        <p className="step-subtitle">
          Define the problem before discussing solutions.
          <br />
          先定义问题，再讨论方案。
        </p>
      </header>

      <GateStatus passed={caseItem.step1.gateStatus.passed} issues={caseItem.step1.gateStatus.issues} />

      <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
        <section className="step-panel">
          <div className="step-panel-head">
            <h2>Core Problem / 核心问题</h2>
            <p>Capture the current state and intended improvement.</p>
          </div>
          <div className="step-panel-grid">
            <BilingualField labelZh="问题陈述" labelEn="Problem statement">
              <textarea rows={4} {...register('problemStatement')} />
              {errors.problemStatement && <span className="field-error">{errors.problemStatement.message}</span>}
            </BilingualField>

            <BilingualField labelZh="现状" labelEn="Baseline">
              <textarea rows={3} {...register('baseline')} />
              {errors.baseline && <span className="field-error">{errors.baseline.message}</span>}
            </BilingualField>

            <BilingualField labelZh="成功指标" labelEn="Success metric">
              <textarea rows={2} {...register('successMetric')} />
              {errors.successMetric && <span className="field-error">{errors.successMetric.message}</span>}
            </BilingualField>

            <BilingualField labelZh="目标改进" labelEn="Target improvement">
              <textarea rows={2} {...register('targetImprovement')} />
              {errors.targetImprovement && <span className="field-error">{errors.targetImprovement.message}</span>}
            </BilingualField>
          </div>
        </section>

        <section className="step-panel">
          <div className="step-panel-head">
            <h2>Scope & Ownership / 范围与归属</h2>
            <p>Clarify team ownership and the cost of not acting.</p>
          </div>
          <div className="step-panel-grid two-col">
            <BilingualField labelZh="负责团队" labelEn="Owner team">
              <input type="text" {...register('ownerTeam')} />
              {errors.ownerTeam && <span className="field-error">{errors.ownerTeam.message}</span>}
            </BilingualField>

            <BilingualField labelZh="范围" labelEn="Scope">
              <select {...register('scope')}>
                <option value="team">Team / 团队</option>
                <option value="department">Department / 部门</option>
                <option value="company">Company / 公司</option>
                <option value="enterprise">Enterprise / 集团</option>
              </select>
            </BilingualField>

            <BilingualField labelZh="不作为成本类型" labelEn="Cost of inaction">
              <select {...register('costOfInactionType')}>
                <option value="financial">Financial / 财务</option>
                <option value="competitive">Competitive / 竞争</option>
                <option value="operational">Operational / 运营</option>
                <option value="reputational">Reputational / 声誉</option>
              </select>
            </BilingualField>

            <BilingualField labelZh="时间周期（周）" labelEn="Timeline (weeks)">
              <input
                type="number"
                min={1}
                max={104}
                {...register('timelineWeeks', {
                  setValueAs: value => (value === '' ? undefined : Number(value)),
                })}
              />
              {errors.timelineWeeks && <span className="field-error">{errors.timelineWeeks.message}</span>}
            </BilingualField>
          </div>
        </section>

        <button type="submit" className="primary-button">Save & Validate Gate / 保存并验证</button>
      </form>

      <section className="ai-helper step-panel">
        <div className="step-panel-head">
          <h2>AI Helper / AI 助手</h2>
          <p>Get interview questions or rewritten problem statements.</p>
        </div>
        <div className="helper-actions">
          <button type="button" onClick={() => runHelper('interview')} disabled={helperLoading}>
            Interview Questions / 追问
          </button>
          <button type="button" onClick={() => runHelper('rewrite')} disabled={helperLoading}>
            Rewrite / 改写建议
          </button>
        </div>
        <div className="ai-output-card">
          {helperLoading
            ? 'Loading... / 正在生成...'
            : helperOutput || 'No output yet. / 暂无输出。'}
        </div>
      </section>
    </div>
  );
};

export default Step1;
