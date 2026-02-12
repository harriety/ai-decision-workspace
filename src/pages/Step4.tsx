import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toJson, toMarkdown } from '@/lib/export';
import { useCaseStore } from '@/store/useCaseStore';

const Step4 = () => {
  const params = useParams();
  const caseId = params.id || '';
  const caseItem = useCaseStore(state => state.cases.find(item => item.id === caseId));
  const updateStep4 = useCaseStore(state => state.updateStep4);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => (caseItem ? toMarkdown(caseItem) : ''), [caseItem]);
  const json = useMemo(() => (caseItem ? toJson(caseItem) : ''), [caseItem]);

  if (!caseItem) {
    return <div>Case not found.</div>;
  }

  if (!caseItem.step1.gateStatus.passed) {
    return <div>Please complete Step 1 first.</div>;
  }

  const handleGenerate = () => {
    updateStep4(caseId, {
      markdown,
      json,
      generatedAt: new Date().toISOString(),
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${caseItem.title || 'decision'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="step-page step4-page">
      <header className="step3-header">
        <p className="step-kicker">Step 4</p>
        <h1>Decision Summary / 决策总结</h1>
        <p className="step-subtitle">
          Generate export-ready summaries for communication and handoff.
          <br />
          生成可导出的总结，便于沟通与交付。
        </p>
      </header>

      <section className="step-panel">
        <div className="step-panel-head">
          <h2>Export Actions / 导出操作</h2>
          <p>Generate current snapshot, then copy Markdown or download JSON.</p>
        </div>
        <div className="step4-actions">
          <button type="button" onClick={handleGenerate}>
            Generate Summary / 生成摘要
          </button>
          <button type="button" onClick={handleCopy}>
            {copied ? 'Copied! / 已复制' : 'Copy Markdown / 复制 Markdown'}
          </button>
          <button type="button" onClick={handleDownload}>
            Download JSON / 下载 JSON
          </button>
        </div>
      </section>

      <div className="step4-preview-grid">
        <section className="step-panel">
          <div className="step-panel-head">
            <h2>Markdown Preview / Markdown 预览</h2>
          </div>
          <div className="ai-output-card export-output">{markdown || 'No markdown generated yet. / 暂无 markdown 输出。'}</div>
        </section>

        <section className="step-panel">
          <div className="step-panel-head">
            <h2>JSON Preview / JSON 预览</h2>
          </div>
          <div className="ai-output-card export-output">{json || 'No JSON generated yet. / 暂无 JSON 输出。'}</div>
        </section>
      </div>
    </div>
  );
};

export default Step4;
