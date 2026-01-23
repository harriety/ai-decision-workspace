interface GateStatusProps {
  passed: boolean;
  issues: string[];
}

const GateStatus = ({ passed, issues }: GateStatusProps) => {
  return (
    <div style={{ padding: '12px', border: '1px solid #ddd' }}>
      <strong>{passed ? 'Gate Passed / 通过' : 'Gate Not Passed / 未通过'}</strong>
      {!passed && issues.length > 0 && (
        <ul>
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GateStatus;
