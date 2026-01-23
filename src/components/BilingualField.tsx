import type { ReactNode } from 'react';

interface BilingualFieldProps {
  labelZh: string;
  labelEn: string;
  children: ReactNode;
}

const BilingualField = ({ labelZh, labelEn, children }: BilingualFieldProps) => {
  return (
    <label style={{ display: 'block', marginBottom: '12px' }}>
      <div style={{ fontWeight: 600 }}>
        {labelZh} / {labelEn}
      </div>
      {children}
    </label>
  );
};

export default BilingualField;
