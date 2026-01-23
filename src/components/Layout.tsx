import { useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCaseStore } from '@/store/useCaseStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getCaseTargetStep } from '@/lib/case';
import type { LLMProvider } from '@/lib/llm/adapter';
import { isProviderAvailable } from '@/lib/llm/adapter';

const Layout = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cases = useCaseStore(state => state.cases);
  const createCase = useCaseStore(state => state.createCase);
  const setActiveCase = useCaseStore(state => state.setActiveCase);
  const activeCaseId = useCaseStore(state => state.activeCaseId);
  const llmProvider = useSettingsStore(state => state.llmProvider);
  const setLlmProvider = useSettingsStore(state => state.setLlmProvider);
  const providerAvailable = isProviderAvailable(llmProvider);

  const activeId = params.id || null;
  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [cases]);
  const activeCase = sortedCases.find(item => item.id === activeId) || null;
  const activeStep = location.pathname.split('/').pop() || 'step-1';

  useEffect(() => {
    if (activeId && activeId !== activeCaseId) {
      setActiveCase(activeId);
    }
  }, [activeId, activeCaseId, setActiveCase]);

  useEffect(() => {
    if (!activeCase && sortedCases.length > 0) {
      const latest = sortedCases[0];
      navigate(`/cases/${latest.id}/${getCaseTargetStep(latest)}`, { replace: true });
    }
  }, [activeCase, sortedCases, navigate]);

  const handleNewCase = () => {
    const nextCase = createCase();
    navigate(`/cases/${nextCase.id}/step-1`);
  };

  const handleProviderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLlmProvider(event.target.value as LLMProvider);
  };

  const stepLinks = activeCase
    ? [
        { id: 'step-1', label: 'Step 1 / 问题澄清', enabled: true },
        { id: 'step-2a', label: 'Step 2A / AI 适配', enabled: activeCase.step1.gateStatus.passed },
        { id: 'step-2b', label: 'Step 2B / ROI 评估', enabled: activeCase.step1.gateStatus.passed },
        { id: 'step-3', label: 'Step 3 / 推荐与决策', enabled: activeCase.step1.gateStatus.passed },
        { id: 'step-4', label: 'Step 4 / 总结导出', enabled: activeCase.step1.gateStatus.passed },
      ]
    : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AI Decision Workspace</h2>
          <button type="button" onClick={handleNewCase}>
            New Case / 新建
          </button>
          <div className="provider-select">
            <label htmlFor="llm-provider">LLM Provider</label>
            <select id="llm-provider" value={llmProvider} onChange={handleProviderChange}>
              <option value="mock">Mock</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="deepseek">DeepSeek</option>
            </select>
            <div className={providerAvailable ? 'provider-status ok' : 'provider-status warn'}>
              {providerAvailable
                ? 'Status: ready'
                : 'Status: missing key, fallback to mock'}
            </div>
          </div>
        </div>
        <div className="case-list">
          {sortedCases.slice(0, 20).map(item => (
            <Link
              key={item.id}
              to={`/cases/${item.id}/${getCaseTargetStep(item)}`}
              className={item.id === activeId ? 'case-item active' : 'case-item'}
            >
              <div className="case-title">{item.title}</div>
              <div className="case-time">{item.updatedAt}</div>
            </Link>
          ))}
        </div>
      </aside>
      <main className="main-area">
        {activeCase && (
          <nav className="step-nav">
            {stepLinks.map(step => (
              <button
                key={step.id}
                type="button"
                className={step.id === activeStep ? 'step-link active' : 'step-link'}
                disabled={!step.enabled}
                onClick={() => navigate(`/cases/${activeCase.id}/${step.id}`)}
              >
                {step.label}
              </button>
            ))}
          </nav>
        )}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
