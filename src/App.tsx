import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Step1 from '@/pages/Step1';
import Step2A from '@/pages/Step2A';
import Step2B from '@/pages/Step2B';
import Step3 from '@/pages/Step3';
import Step4 from '@/pages/Step4';
import { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import { useCaseStore } from '@/store/useCaseStore';
import { getCaseTargetStep } from '@/lib/case';

const CreateCaseRedirect = () => {
  const createCase = useCaseStore(state => state.createCase);
  const [caseId, setCaseId] = useState<string | null>(null);
  const createdRef = useRef(false);

  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    const nextCase = createCase();
    setCaseId(nextCase.id);
  }, [createCase]);

  if (!caseId) return null;

  return <Navigate to={`/cases/${caseId}/step-1`} replace />;
};

const RootRedirect = () => {
  const cases = useCaseStore(state => state.cases);
  const sortedCases = useMemo(() => {
    return [...cases].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [cases]);

  if (sortedCases.length === 0) {
    return <Navigate to="/cases/new/step-1" replace />;
  }

  const latest = sortedCases[0];
  return <Navigate to={`/cases/${latest.id}/${getCaseTargetStep(latest)}`} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/cases/new/step-1" element={<CreateCaseRedirect />} />
        <Route path="/cases/:id" element={<Layout />}>
          <Route path="step-1" element={<Step1 />} />
          <Route path="step-2a" element={<Step2A />} />
          <Route path="step-2b" element={<Step2B />} />
          <Route path="step-3" element={<Step3 />} />
          <Route path="step-4" element={<Step4 />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
