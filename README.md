# AI Decision Workspace

A company-internal "AI Decision Workspace" that forces Problem Clarification before AI modeling, supports ROI weighting + scoring, maps to a 2x2 quadrant, provides AI-generated recommendation reasons (human decides), and exports a bilingual decision summary.

## Why This Differs from Chatting with AI Directly

Traditional AI chats often jump to solutions without proper problem analysis. This workspace enforces:
1. **Problem-first approach**: Must complete problem clarification before AI modeling
2. **Structured decision framework**: ROI weighting, scoring, and quadrant mapping
3. **Human-in-the-loop**: AI provides recommendations, but humans make final decisions
4. **Bilingual documentation**: All decisions documented in both Chinese and English
5. **Versioned snapshots**: Track decision evolution over time

## Quick Start

1. **Clone and install**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local to add optional API keys
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
Visit http://localhost:5173

## Project Structure

```
ai-decision-workspace/
├── src/
│   ├── components/          # React components
│   │   ├── GateStatus.tsx   # Gate validation banner
│   │   ├── RoiQuadrant.tsx  # 2x2 quadrant visualization
│   │   └── BilingualField.tsx # Bilingual form fields
│   ├── lib/
│   │   ├── llm/            # LLM adapter skeleton
│   │   │   ├── adapter.ts  # Provider-agnostic LLM
│   │   │   └── prompts.ts  # Prompt builders
│   │   ├── export.ts       # Markdown/JSON export
│   │   └── roi.ts          # ROI calculations
│   ├── models/
│   │   └── types.ts        # TypeScript types
│   ├── store/
│   │   └── useCaseStore.ts # Zustand store
│   ├── pages/              # Wizard steps
│   │   ├── Step1.tsx       # Problem clarification
│   │   ├── Step2A.tsx      # AI fit modeling
│   │   ├── Step2B.tsx      # ROI weighting + scoring
│   │   ├── Step3.tsx       # Recommendations
│   │   └── Step4.tsx       # Decision summary
│   └── App.tsx             # Main app with router
├── public/
└── package.json
```

## Features

### Step 1: Problem Clarification Gate
- Required fields with quality validation
- Rejects solution-leading phrases
- Interview/Editor AI helper panel
- Must pass gate to proceed

### Step 2A: AI Fit Modeling
- Is this an AI problem?
- AI role definition
- Data readiness assessment
- Human-in-the-loop requirements

### Step 2B: Strategic ROI Lens
- **Left column**:
  - Section 1: Set weights (0-5) with auto percent
  - Section 2: Score inputs (0-3) with AI suggestions
  - Section 3: Quadrant rationale with confirmation
- **Right column**: Live ROI panel
- Dynamic quadrant mapping

### Step 3: Recommendations
- AI-generated recommendation reasons
- Counterarguments
- Required human decision fields

### Step 4: Decision Summary
- Bilingual Markdown export
- JSON export
- Copy to clipboard
- Versioned snapshots

## Data Model

- **Case**: Complete decision workflow
- **Step1**: ProblemForm with gate validation
- **Step2A**: FitModel for AI suitability
- **Step2B**: RoiModel with weights, scores, quadrant
- **Step3**: DecisionModel with human choice
- **Step4**: Summary export

## ROI Quadrant

- **X-axis**: Normalized investment (0-1)
- **Y-axis**: Normalized return (0-1)
- **Quadrants**:
  - Low X / High Y → "Quick Wins"
  - High X / High Y → "Strategic Bets"
  - Low X / Low Y → "Hygiene / Tactical"
  - High X / Low Y → "Experiments / Optional"

## Local-First Architecture

- Zustand store with localStorage persistence
- Versioned snapshots (last 10)
- Debounced saves (500ms)
- No backend required

## Roadmap

### Phase 2
- Excel import/export
- Team collaboration backend
- Advanced analytics dashboard
- Integration with project management tools
- Customizable validation rules

### Phase 3
- Multi-team workspace
- Advanced reporting
- API for external integration
- Mobile app

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## Environment Variables

See `.env.example` for optional configuration:
- `VITE_OPENAI_API_KEY`: OpenAI API key
- `VITE_GEMINI_API_KEY`: Google Gemini API key
- `VITE_DEEPSEEK_API_KEY`: DeepSeek API key
- `VITE_LLM_PROVIDER`: Default provider (mock/openai/gemini/deepseek)

## License

MIT