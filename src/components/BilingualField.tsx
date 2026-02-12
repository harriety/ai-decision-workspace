import type { ReactNode } from 'react';

interface BilingualFieldProps {
  labelZh: string;
  labelEn: string;
  children: ReactNode;
}

const BilingualField = ({ labelZh, labelEn, children }: BilingualFieldProps) => {
  return (
    <label className="field-block">
      <div className="field-label">
        {labelZh} / {labelEn}
      </div>
      {children}
    </label>
  );
};

export default BilingualField;
