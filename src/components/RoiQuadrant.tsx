interface RoiQuadrantProps {
  x: number;
  y: number;
  thresholdX?: number;
  thresholdY?: number;
}

const RoiQuadrant = ({ x, y, thresholdX = 0.5, thresholdY = 0.5 }: RoiQuadrantProps) => {
  const size = 240;
  const padding = 24;
  const plotSize = size - padding * 2;
  const px = padding + x * plotSize;
  const py = padding + (1 - y) * plotSize;
  const tx = padding + thresholdX * plotSize;
  const ty = padding + (1 - thresholdY) * plotSize;
  const labelOffset = 10;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={padding} y={padding} width={plotSize} height={plotSize} fill="#f7f7f7" stroke="#ccc" />
      <line x1={tx} y1={padding} x2={tx} y2={padding + plotSize} stroke="#999" />
      <line x1={padding} y1={ty} x2={padding + plotSize} y2={ty} stroke="#999" />
      <text x={padding + labelOffset} y={padding + labelOffset} fontSize="9" fill="#666">
        Quick Wins
      </text>
      <text x={tx + labelOffset} y={padding + labelOffset} fontSize="9" fill="#666">
        Strategic Bets
      </text>
      <text x={padding + labelOffset} y={ty + labelOffset} fontSize="9" fill="#666">
        Hygiene
      </text>
      <text x={tx + labelOffset} y={ty + labelOffset} fontSize="9" fill="#666">
        Experiments
      </text>
      <circle cx={px} cy={py} r={6} fill="#333" />
      <text x={size / 2} y={size - 4} textAnchor="middle" fontSize="10">Investment</text>
      <text x={4} y={size / 2} textAnchor="middle" fontSize="10" transform={`rotate(-90 4 ${size / 2})`}>Return</text>
    </svg>
  );
};

export default RoiQuadrant;
