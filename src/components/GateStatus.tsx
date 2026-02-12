interface GateStatusProps {
  passed: boolean;
  issues: string[];
}

const GateStatus = ({ passed, issues }: GateStatusProps) => {
  return (
    <div className={passed ? 'gate-status-card gate-pass' : 'gate-status-card gate-fail'}>
      <strong>{passed ? 'Gate Passed / 通过' : 'Gate Not Passed / 未通过'}</strong>
      {!passed && issues.length > 0 && (
        <ul className="gate-issues">
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GateStatus;
