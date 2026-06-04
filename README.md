# AI Concept Explainer for JEE & NEET

An AI-powered web application that provides crystal-clear explanations for JEE (Joint Entrance Examination) and NEET (National Eligibility cum Entrance Test) topics. Built for students preparing for India's most competitive engineering and medical entrance exams.

![AI Concept Explainer](https://img.shields.io/badge/AI-Powered-blue) ![JEE](https://img.shields.io/badge/JEE-Main%20%26%20Advanced-orange) ![NEET](https://img.shields.io/badge/NEET-UG-green)

## ✨ Features

### 📚 Comprehensive Topic Coverage

**JEE (Main & Advanced):**
- **Physics**: Mechanics, Thermodynamics, Electromagnetism, Optics, Modern Physics, Waves & Oscillations
- **Chemistry**: Physical Chemistry, Organic Chemistry, Inorganic Chemistry
- **Mathematics**: Algebra, Calculus, Coordinate Geometry, Trigonometry, Vectors, Probability & Statistics

**NEET:**
- **Physics**: Classical Mechanics, Thermodynamics, Electrostatics, Magnetism, Optics
- **Chemistry**: Physical, Organic & Inorganic Chemistry with biological applications
- **Biology**: Botany, Zoology, Human Physiology, Genetics, Ecology, Cell Biology, Molecular Biology

### 🧠 Smart Explanations

Each topic explanation includes:

1. **Step-by-Step Breakdown** - Concepts explained in 3-5 digestible steps with proper mathematical notation
2. **Worked Example** - A realistic numerical problem with complete solution, matching JEE/NEET exam pattern
3. **Practice MCQ** - Multiple choice question with:
   - 4 options matching exam format
   - Detailed explanation of the correct answer
   - Analysis of why each wrong answer is incorrect (common traps and misconceptions)
4. **Key Takeaways** - Quick revision points to remember

### 🔢 Beautiful Math Rendering

- LaTeX-powered mathematical expressions using KaTeX
- Inline formulas: `$F = ma$`, `$E = mc^2$`
- Display equations for complex derivations
- Chemical equations and biological nomenclature

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Math Rendering**: KaTeX
- **Backend**: Supabase Edge Functions
- **AI**: Lovable AI Gateway (Google Gemini)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-concept-explainer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Set `LOVABLE_API_KEY` as a Supabase Edge Function secret. Do not put provider secrets in Vite env files because Vite variables are bundled into the browser.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── ExplanationCard.tsx    # Card wrapper for sections
│   │   ├── KeyTakeaways.tsx       # Key points component
│   │   ├── LoadingState.tsx       # Loading animation
│   │   ├── MathRenderer.tsx       # LaTeX math rendering
│   │   ├── MCQSection.tsx         # MCQ with answer reveal
│   │   ├── StepBreakdown.tsx      # Step-by-step content
│   │   ├── TopicInput.tsx         # Search input
│   │   └── WorkedExample.tsx      # Problem solution display
│   ├── pages/
│   │   └── Index.tsx              # Main application page
│   └── hooks/
│       └── use-toast.ts           # Toast notifications
├── supabase/
│   └── functions/
│       └── explain-topic/         # AI edge function
│           └── index.ts
└── README.md
```

## 🎯 Usage

1. **Enter a Topic**: Type any JEE/NEET topic in the search bar
   - Examples: "Newton's Laws", "Organic Chemistry Reactions", "Integration by Parts", "Cell Division"

2. **Get Explanation**: Click "Explain" to generate a comprehensive breakdown

3. **Learn**: 
   - Read through the step-by-step concept breakdown
   - Study the worked example with full solution
   - Test yourself with the practice MCQ
   - Review key takeaways for quick revision

4. **Explore More**: Click "Explore Another Topic" to learn something new

## 📖 Supported Topics

### Physics (JEE & NEET)
| Topic | Subtopics |
|-------|-----------|
| Mechanics | Kinematics, Newton's Laws, Work-Energy, Rotational Motion, Gravitation |
| Thermodynamics | Laws of Thermodynamics, Heat Transfer, Kinetic Theory |
| Electromagnetism | Electrostatics, Current Electricity, Magnetism, EMI |
| Optics | Ray Optics, Wave Optics, Optical Instruments |
| Modern Physics | Photoelectric Effect, Atomic Structure, Nuclear Physics |
| Waves | SHM, Wave Motion, Sound, Doppler Effect |

### Chemistry (JEE & NEET)
| Topic | Subtopics |
|-------|-----------|
| Physical Chemistry | Atomic Structure, Chemical Bonding, Thermodynamics, Equilibrium, Electrochemistry |
| Organic Chemistry | Hydrocarbons, Functional Groups, Reaction Mechanisms, Biomolecules |
| Inorganic Chemistry | Periodic Table, Coordination Compounds, Metallurgy, p-block Elements |

### Mathematics (JEE)
| Topic | Subtopics |
|-------|-----------|
| Algebra | Quadratic Equations, Complex Numbers, Matrices, Sequences & Series |
| Calculus | Limits, Differentiation, Integration, Differential Equations |
| Coordinate Geometry | Straight Lines, Circles, Conic Sections |
| Trigonometry | Identities, Equations, Inverse Functions |
| Vectors & 3D | Vector Algebra, 3D Geometry |

### Biology (NEET)
| Topic | Subtopics |
|-------|-----------|
| Botany | Plant Anatomy, Photosynthesis, Plant Reproduction, Ecology |
| Zoology | Animal Physiology, Human Reproduction, Evolution |
| Cell Biology | Cell Structure, Cell Division, Biomolecules |
| Genetics | Mendelian Genetics, Molecular Biology, Biotechnology |

## 🔧 API Reference

### Edge Function: `explain-topic`

**Endpoint**: `POST /functions/v1/explain-topic`

**Request Body**:
```json
{
  "topic": "Newton's Laws of Motion"
}
```

**Response**:
```json
{
  "title": "Newton's Laws of Motion",
  "overview": "...",
  "steps": [...],
  "workedExample": {...},
  "mcq": {...},
  "keyTakeaways": [...]
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

- Real `.env` files are ignored; only `.env.example` should be committed.
- `LOVABLE_API_KEY` belongs in Supabase Edge Function secrets, never in frontend env.
- The frontend validates Supabase config before calling the function.
- Topic input is bounded on the frontend and edge function.
- Topic whitespace is normalized consistently before validation and model prompting.
- The edge function treats topic text as untrusted input and instructs the model not to follow embedded prompt-injection instructions.
- Generated explanations are structurally validated on both the edge function
  and frontend before rendering.
- Generated explanation text fields and MCQ options are length-bounded before
  rendering.
- Edge Function CORS can be restricted with `ALLOWED_ORIGINS`; wildcard origins
  are ignored.
- AI-generated math is rendered through KaTeX with trusted commands disabled.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- AI powered by Lovable AI Gateway
- Math rendering by [KaTeX](https://katex.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**Made with ❤️ for JEE & NEET aspirants**
