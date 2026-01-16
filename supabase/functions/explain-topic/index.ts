import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const systemPrompt = `You are an expert JEE/NEET tutor who explains complex physics, chemistry, and mathematics concepts with exceptional clarity. Your goal is to make any topic crystal clear for competitive exam preparation.

Important guidelines:
- Include 3-5 steps in the concept breakdown
- Use LaTeX notation for ALL mathematical expressions (e.g., $F = ma$ for inline, $$E = mc^2$$ for display)
- Make the worked example realistic with actual numbers
- The MCQ should test conceptual understanding, not just memorization
- Explain each wrong answer thoroughly so students understand common misconceptions
- Keep language clear and accessible for students preparing for competitive exams`;

    // Use tool calling for structured output to avoid JSON escaping issues with LaTeX
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
          { role: "user", content: `Explain the topic: "${topic}" for JEE/NEET preparation. Use the explain_topic tool to provide a comprehensive breakdown.` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "explain_topic",
              description: "Provide a structured explanation of a JEE/NEET topic with steps, worked example, MCQ, and key takeaways",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string", 
                    description: "The topic name/title" 
                  },
                  overview: { 
                    type: "string", 
                    description: "A brief 2-3 sentence overview of the topic and its importance for JEE/NEET" 
                  },
                  steps: {
                    type: "array",
                    description: "3-5 step-by-step concept breakdown",
                    items: {
                      type: "object",
                      properties: {
                        stepNumber: { type: "number" },
                        title: { type: "string" },
                        content: { type: "string", description: "Detailed explanation with LaTeX formulas like $F = ma$" }
                      },
                      required: ["stepNumber", "title", "content"]
                    }
                  },
                  workedExample: {
                    type: "object",
                    properties: {
                      problem: { type: "string", description: "A specific numerical problem statement" },
                      given: { type: "array", items: { type: "string" }, description: "List of given values with units" },
                      toFind: { type: "string", description: "What we need to find" },
                      solution: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            step: { type: "number" },
                            explanation: { type: "string" },
                            calculation: { type: "string", description: "Mathematical calculation with LaTeX" }
                          },
                          required: ["step", "explanation", "calculation"]
                        }
                      },
                      answer: { type: "string", description: "Final answer with units" }
                    },
                    required: ["problem", "given", "toFind", "solution", "answer"]
                  },
                  mcq: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" }, description: "4 options labeled A), B), C), D)" },
                      correctAnswer: { type: "string", description: "Just the letter: A, B, C, or D" },
                      explanation: { type: "string", description: "Why the correct answer is correct" },
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
                    description: "3-5 key points to remember"
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
        const parsedContent = JSON.parse(toolCall.function.arguments);
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
