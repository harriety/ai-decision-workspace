// ============================================
// Mock LLM Provider - Deterministic Responses
// ============================================

import { LLMRequest, LLMResponse } from './adapter';

// ============================================
// Response Templates
// ============================================

const RESPONSE_TEMPLATES = {
  // Problem clarification responses
  problemClarification: {
    interviewQuestions: `Based on your problem statement, here are some clarifying questions:

1. What specific pain points are users experiencing?
2. How is this problem currently being addressed (if at all)?
3. What data sources are available to measure the current state?
4. Who are the key stakeholders affected by this problem?
5. What would success look like in 6 months?`,
    
    rewriteSuggestion: `Here's a more structured problem statement:

**Current Situation**: [Describe current process/pain points with specific metrics]
**Impact**: [Quantify the impact - e.g., "Costing $X annually" or "Taking Y hours per week"]
**Desired Outcome**: [Clear, measurable goal - e.g., "Reduce time by Z%" or "Increase accuracy to W%"]
**Constraints**: [Any technical, budget, or timeline constraints]`,
  },
  
  // ROI score suggestions
  roiScoreSuggestion: {
    cost: `Based on typical AI projects:
- Cost savings potential: 2/3 (moderate)
- Consider both direct cost reduction and efficiency gains`,
    
    efficiency: `Efficiency improvements often significant with AI:
- Score: 3/3 (high)
- AI can automate repetitive tasks and accelerate processes`,
    
    quality: `Quality enhancement varies:
- Score: 2/3 (moderate)
- AI can improve consistency but may require human oversight`,
    
    risk: `Risk reduction considerations:
- Score: 1/3 (low) or 2/3 (moderate)
- AI introduces new risks (bias, errors) while reducing others`,
    
    capability: `Capability building potential:
- Score: 2/3 (moderate)
- Enables new capabilities but requires skill development`,
    
    data: `Data investment required:
- Score: 2/3 (moderate) to 3/3 (high)
- Depends on data availability and quality`,
    
    engineering: `Engineering effort:
- Score: 3/3 (high) for custom solutions
- Score: 1/3 (low) for off-the-shelf tools`,
    
    change: `Change management:
- Score: 2/3 (moderate)
- User adoption and process changes required`,
  },
  
  // Recommendation reasons
  recommendationReasons: {
    quickWins: `**中文**
**为什么这是“快速见效”机会**:
- 技术复杂度较低
- 短期影响较高
- ROI 相对清晰
- 组织变更成本较小

**建议路径**: 基于现有工具和数据先做试点。

**English**
**Why this is a Quick Win**:
- Low technical complexity
- High immediate impact
- Clear ROI
- Minimal organizational change required

**Recommended approach**: Start with a pilot using existing tools and data.`,
    
    strategicBets: `**中文**
**为什么这是“战略下注”**:
- 与长期业务战略一致
- 有机会形成竞争优势
- 需要较大投入
- 潜在回报较高

**建议路径**: 制定分阶段路线图，设置明确里程碑并定期复盘。

**English**
**Why this is a Strategic Bet**:
- Aligns with long-term business strategy
- Creates competitive advantage
- Requires significant investment
- High potential return

**Recommended approach**: Build a phased roadmap with clear milestones and regular reviews.`,
    
    hygiene: `**中文**
**为什么这是“基础维护/战术性”事项**:
- 偏向必要维护或合规
- 战略价值有限
- 风险和回报都偏低
- 主要作用是保持运营稳定

**建议路径**: 纳入常规维护周期推进。

**English**
**Why this is Hygiene/Tactical**:
- Necessary maintenance or compliance
- Limited strategic value
- Low risk, low reward
- Keeps operations running smoothly

**Recommended approach**: Deliver it as part of regular maintenance cycles.`,
    
    experiments: `**中文**
**为什么这是“实验/可选”方向**:
- 不确定性较高
- 学习价值明显
- 可能带来未来创新
- 短期业务价值有限

**建议路径**: 以时间盒实验方式推进，并定义清晰学习目标。

**English**
**Why this is Experimental/Optional**:
- High uncertainty
- Learning opportunity
- May lead to future innovations
- Limited immediate business value

**Recommended approach**: Run a time-boxed experiment with explicit learning goals.`,
  },
  
  // Counterarguments
  counterarguments: {
    quickWins: `**Potential Issues with Quick Wins**:
- May address symptoms rather than root causes
- Could create technical debt
- Might not scale well
- Opportunity cost of not pursuing more strategic initiatives`,
    
    strategicBets: `**Risks with Strategic Bets**:
- High failure rate for ambitious projects
- Long time to value
- Resource intensive
- May become obsolete due to market changes`,
    
    hygiene: `**Limitations of Hygiene Projects**:
- Does not create competitive advantage
- May not justify AI implementation
- Could be done with simpler solutions
- Limited innovation potential`,
    
    experiments: `**Challenges with Experiments**:
- Difficult to justify ROI
- May distract from core business
- Results may not be actionable
- Requires specialized skills`,
  },
};

// ============================================
// Response Generation Logic
// ============================================

/**
 * Generate deterministic response based on input
 */
function generateDeterministicResponse(
  systemPrompt: string,
  userPrompt: string
): string {
  const lowerSystem = systemPrompt.toLowerCase();
  const lowerUser = userPrompt.toLowerCase();
  
  // Problem clarification responses
  if (lowerSystem.includes('problem') || lowerSystem.includes('clarify')) {
    if (lowerUser.includes('interview') || lowerUser.includes('question')) {
      return RESPONSE_TEMPLATES.problemClarification.interviewQuestions;
    }
    if (lowerUser.includes('rewrite') || lowerUser.includes('improve')) {
      return RESPONSE_TEMPLATES.problemClarification.rewriteSuggestion;
    }
  }
  
  // ROI score suggestions
  if (lowerSystem.includes('roi') || lowerSystem.includes('score')) {
    if (lowerUser.includes('cost')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.cost;
    }
    if (lowerUser.includes('efficiency')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.efficiency;
    }
    if (lowerUser.includes('quality')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.quality;
    }
    if (lowerUser.includes('risk')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.risk;
    }
    if (lowerUser.includes('capability')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.capability;
    }
    if (lowerUser.includes('data')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.data;
    }
    if (lowerUser.includes('engineering')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.engineering;
    }
    if (lowerUser.includes('change')) {
      return RESPONSE_TEMPLATES.roiScoreSuggestion.change;
    }
    
    // General ROI advice
    return `Based on your inputs, here are suggested scores:

**Return Scores**:
- Cost: 2/3 (moderate savings potential)
- Efficiency: 3/3 (high improvement likely)
- Quality: 2/3 (moderate enhancement)
- Risk: 1/3 (low reduction)
- Capability: 2/3 (moderate new capabilities)

**Investment Scores**:
- Data: 2/3 (moderate preparation needed)
- Engineering: 3/3 (significant effort required)
- Change: 2/3 (moderate organizational change)`;
  }
  
  // Recommendation reasons
  if (lowerSystem.includes('recommend') || lowerSystem.includes('advice')) {
    if (lowerUser.includes('quick') || lowerUser.includes('win')) {
      return RESPONSE_TEMPLATES.recommendationReasons.quickWins;
    }
    if (lowerUser.includes('strategic') || lowerUser.includes('bet')) {
      return RESPONSE_TEMPLATES.recommendationReasons.strategicBets;
    }
    if (lowerUser.includes('hygiene') || lowerUser.includes('tactical')) {
      return RESPONSE_TEMPLATES.recommendationReasons.hygiene;
    }
    if (lowerUser.includes('experiment') || lowerUser.includes('optional')) {
      return RESPONSE_TEMPLATES.recommendationReasons.experiments;
    }
    
    // General recommendation
    return `**中文**
**AI 推荐方向**:
基于 ROI 分析，该项目更接近“快速见效（Quick Wins）”象限。

**核心理由**:
1. 回报潜力中高
2. 投入要求相对可控
3. 实施路径较清晰
4. 与现有能力匹配度较高

**反方观点**:
1. 可能只解决局部问题，而非根因
2. 试点成功不代表规模化成功
3. 业务收益可能受数据质量限制

**下一步建议**:
1. 先定义量化成功指标
2. 明确试点范围与人群
3. 建立基线数据并设置复盘节点

**English**
**AI recommendation direction**:
Based on ROI analysis, this initiative appears to be in the Quick Wins quadrant.

**Key reasons**:
1. Moderate-to-high return potential
2. Relatively manageable investment
3. Clear implementation path
4. Strong alignment with current capabilities

**Counterarguments**:
1. It may solve symptoms instead of root causes
2. Pilot success may not guarantee scale success
3. Business impact may be constrained by data quality

**Suggested next steps**:
1. Define measurable success metrics
2. Set a clear pilot scope and target group
3. Establish baseline metrics and review checkpoints`;
  }
  
  // Counterarguments
  if (lowerSystem.includes('counter') || lowerSystem.includes('risk')) {
    if (lowerUser.includes('quick') || lowerUser.includes('win')) {
      return RESPONSE_TEMPLATES.counterarguments.quickWins;
    }
    if (lowerUser.includes('strategic') || lowerUser.includes('bet')) {
      return RESPONSE_TEMPLATES.counterarguments.strategicBets;
    }
    if (lowerUser.includes('hygiene') || lowerUser.includes('tactical')) {
      return RESPONSE_TEMPLATES.counterarguments.hygiene;
    }
    if (lowerUser.includes('experiment') || lowerUser.includes('optional')) {
      return RESPONSE_TEMPLATES.counterarguments.experiments;
    }
  }
  
  // Default response
  return `I've analyzed your request regarding "${userPrompt.substring(0, 50)}..."

**Key Insights**:
1. The problem appears to be well-defined with clear objectives
2. There are measurable success criteria
3. Stakeholder alignment seems achievable
4. Technical feasibility is moderate to high

**Recommendations**:
1. Proceed with detailed planning
2. Establish clear metrics and monitoring
3. Consider a phased approach
4. Plan for change management

**Next Actions**:
- Document the decision rationale
- Create implementation timeline
- Identify resource requirements
- Schedule regular review points`;
}

// ============================================
// Main Mock Generation Function
// ============================================

/**
 * Generate text using mock provider
 */
export async function generateText(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();
  
  // Simulate minimal latency (deterministic)
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const responseText = generateDeterministicResponse(
    request.systemPrompt,
    request.userPrompt
  );
  
  const latencyMs = Date.now() - startTime;
  
  return {
    text: responseText,
    provider: 'mock',
    model: 'mock-v1',
    usage: {
      promptTokens: estimateTokens(request.systemPrompt + request.userPrompt),
      completionTokens: estimateTokens(responseText),
      totalTokens: estimateTokens(request.systemPrompt + request.userPrompt + responseText),
    },
    latencyMs,
  };
}

/**
 * Estimate token count (mock version)
 */
function estimateTokens(text: string): number {
  // Simple approximation for mock
  return Math.ceil(text.length / 4);
}

/**
 * Generate multiple mock responses
 */
export async function generateTextBatch(
  requests: LLMRequest[]
): Promise<LLMResponse[]> {
  const responses: LLMResponse[] = [];
  
  for (const request of requests) {
    const response = await generateText(request);
    responses.push(response);
  }
  
  return responses;
}

/**
 * Get mock provider status
 */
export function getMockStatus() {
  return {
    available: true,
    provider: 'mock',
    capabilities: [
      'problem_clarification',
      'roi_analysis',
      'recommendation_generation',
      'counterargument_generation',
    ],
    limits: {
      maxTokens: 2000,
      maxRequestsPerMinute: 60,
      supportedLanguages: ['en', 'zh'],
    },
  };
}
