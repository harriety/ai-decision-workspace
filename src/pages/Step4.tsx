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
    <div className="step-page">
      <h1>Decision Summary / 决策总结</h1>
      <div className="helper-actions">
        <button type="button" onClick={handleGenerate}>
          Generate Summary / 生成摘要
        </button>
        <button type="button" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy Markdown / 复制 Markdown'}
        </button>
        <button type="button" onClick={handleDownload}>
          Download JSON / 下载 JSON
        </button>
      </div>
      <textarea rows={16} readOnly value={markdown} />
    </div>
  );
};

export default Step4;
