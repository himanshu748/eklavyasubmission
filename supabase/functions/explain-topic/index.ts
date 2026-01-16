import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to ensure LaTeX expressions are wrapped in $ delimiters
function ensureLatexDelimiters(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // If already has $ delimiters, return as is
  if (text.includes('$')) return text;
  
  // Common LaTeX patterns that should be wrapped
  const latexPatterns = [
    /\\frac\{[^}]+\}\{[^}]+\}/g,
    /\\sqrt\{[^}]+\}/g,
    /\\text\{[^}]+\}/g,
    /\\Delta\s*\w+/g,
    /\\vec\{[^}]+\}/g,
    /\\sum|\\int|\\prod/g,
    /\\alpha|\\beta|\\gamma|\\theta|\\omega|\\lambda|\\mu|\\sigma|\\pi/g,
    /\\times|\\div|\\pm|\\mp|\\cdot/g,
    /\\leq|\\geq|\\neq|\\approx/g,
    /\^\{[^}]+\}|_\{[^}]+\}/g,
  ];
  
  let hasLatex = false;
  for (const pattern of latexPatterns) {
    if (pattern.test(text)) {
      hasLatex = true;
      break;
    }
  }
  
  // If the text contains LaTeX commands but no $, wrap standalone equations
  if (hasLatex) {
    // Find lines that are purely mathematical (contain LaTeX but minimal text)
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      // If line starts with a backslash command or contains = with LaTeX, wrap it
      if (/^\\[a-zA-Z]/.test(trimmed) || (/=/.test(trimmed) && /\\[a-zA-Z]/.test(trimmed))) {
        // Check if it's a display equation (standalone line)
        if (trimmed.length > 0 && !trimmed.startsWith('$')) {
          return `$$${trimmed}$$`;
        }
      }
      return line;
    });
    return processedLines.join('\n');
  }
  
  return text;
}

// Process the entire response to fix LaTeX delimiters
function processResponse(obj: any): any {
  if (typeof obj === 'string') {
    return ensureLatexDelimiters(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => processResponse(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const processed: any = {};
    for (const key of Object.keys(obj)) {
      processed[key] = processResponse(obj[key]);
    }
    return processed;
  }
  return obj;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert JEE/NEET tutor who explains complex concepts with exceptional clarity. You specialize in all subjects covered in JEE and NEET exams:

**JEE (Main & Advanced) Subjects:**
- Physics: Mechanics, Thermodynamics, Electromagnetism, Optics, Modern Physics, Waves
- Chemistry: Physical Chemistry, Organic Chemistry, Inorganic Chemistry
- Mathematics: Algebra, Calculus, Coordinate Geometry, Trigonometry, Vectors, Probability

**NEET Subjects:**
- Physics: Same as JEE with emphasis on conceptual understanding
- Chemistry: Physical, Organic, Inorganic Chemistry with biology applications
- Biology: Botany, Zoology, Human Physiology, Genetics, Ecology, Cell Biology

Your goal is to make any JEE/NEET topic crystal clear for competitive exam preparation.

CRITICAL LaTeX FORMATTING RULES:
- ALWAYS wrap inline math with single dollar signs: $F = ma$
- ALWAYS wrap display/block equations with double dollar signs: $$E = mc^2$$
- NEVER write raw LaTeX without dollar sign delimiters
- Examples of CORRECT formatting:
  - Inline: "The force is $F = ma$ where $m$ is mass"
  - Display: "The equation is: $$\\frac{d^2x}{dt^2} = -\\omega^2 x$$"
- Examples of WRONG formatting (never do this):
  - "The force is F = ma" (missing $)
  - "\\frac{1}{2}mv^2" (missing $$)

Other guidelines:
- Include 3-5 steps in the concept breakdown
- Make the worked example realistic with actual numbers from typical JEE/NEET problems
- The MCQ should match JEE/NEET exam pattern and difficulty
- Explain each wrong answer thoroughly
- Keep language clear and accessible`;

    // Use tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Explain the topic: "${topic}" for JEE/NEET preparation. Use the explain_topic tool. IMPORTANT: Always wrap ALL math expressions in $ or $$ delimiters.` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "explain_topic",
              description: "Provide a structured explanation of a JEE/NEET topic. CRITICAL: All mathematical expressions MUST be wrapped in LaTeX delimiters - use $...$ for inline math and $$...$$ for display equations.",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string", 
                    description: "The topic name/title" 
                  },
                  overview: { 
                    type: "string", 
                    description: "A brief 2-3 sentence overview. Use $...$ for any math expressions." 
                  },
                  steps: {
                    type: "array",
                    description: "3-5 step-by-step concept breakdown",
                    items: {
                      type: "object",
                      properties: {
                        stepNumber: { type: "number" },
                        title: { type: "string" },
                        content: { type: "string", description: "Detailed explanation. MUST use $...$ for inline math (e.g., $F = ma$) and $$...$$ for display equations (e.g., $$a = \\frac{v-u}{t}$$)" }
                      },
                      required: ["stepNumber", "title", "content"]
                    }
                  },
                  workedExample: {
                    type: "object",
                    properties: {
                      problem: { type: "string", description: "Problem statement with $...$ for math" },
                      given: { type: "array", items: { type: "string" }, description: "Given values. Use $...$ for math like $u = 0$ m/s" },
                      toFind: { type: "string", description: "What to find. Use $...$ for variables like $a = ?$" },
                      solution: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            step: { type: "number" },
                            explanation: { type: "string" },
                            calculation: { type: "string", description: "MUST be wrapped in $...$ or $$...$$. Example: $$a = \\frac{v - u}{t} = \\frac{10 - 0}{4} = 2.5 \\text{ m/s}^2$$" }
                          },
                          required: ["step", "explanation", "calculation"]
                        }
                      },
                      answer: { type: "string", description: "Final answer. Use $...$ for math like $a = 2.5$ m/s²" }
                    },
                    required: ["problem", "given", "toFind", "solution", "answer"]
                  },
                  mcq: {
                    type: "object",
                    properties: {
                      question: { type: "string", description: "Question with $...$ for any math" },
                      options: { type: "array", items: { type: "string" }, description: "4 options. Use $...$ for math in options" },
                      correctAnswer: { type: "string", description: "Just the letter: A, B, C, or D" },
                      explanation: { type: "string", description: "Explanation with $...$ for math" },
                      wrongAnswerExplanations: {
                        type: "object",
                        properties: {
                          B: { type: "string" },
                          C: { type: "string" },
                          D: { type: "string" }
                        }
                      }
                    },
                    required: ["question", "options", "correctAnswer", "explanation", "wrongAnswerExplanations"]
                  },
                  keyTakeaways: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 key points. Use $...$ for any formulas"
                  }
                },
                required: ["title", "overview", "steps", "workedExample", "mcq", "keyTakeaways"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "explain_topic" } },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate explanation" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    
    // Extract the tool call arguments
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      try {
        let parsedContent = JSON.parse(toolCall.function.arguments);
        // Process to ensure LaTeX delimiters are present
        parsedContent = processResponse(parsedContent);
        return new Response(JSON.stringify(parsedContent), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse tool arguments:", parseError);
        return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback to regular content if no tool call
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      return new Response(JSON.stringify({ rawContent: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No content in response");
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
