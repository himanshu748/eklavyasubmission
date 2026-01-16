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

When explaining a topic, you MUST structure your response EXACTLY in this JSON format:

{
  "title": "Topic Name",
  "overview": "A brief 2-3 sentence overview of what this topic is about and why it's important for JEE/NEET",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "content": "Detailed explanation of this concept. Use simple language. Include relevant formulas using LaTeX format like $F = ma$ for inline or $$E = mc^2$$ for display equations."
    }
  ],
  "workedExample": {
    "problem": "A specific numerical problem statement",
    "given": ["List of given values with units"],
    "toFind": "What we need to find",
    "solution": [
      {
        "step": 1,
        "explanation": "What we do in this step",
        "calculation": "The mathematical calculation using LaTeX like $v = u + at = 0 + 2 \\times 5 = 10 \\text{ m/s}$"
      }
    ],
    "answer": "Final answer with units and proper formatting"
  },
  "mcq": {
    "question": "A well-crafted MCQ testing the concept",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why the correct answer is correct",
    "wrongAnswerExplanations": {
      "B": "Why option B is wrong",
      "C": "Why option C is wrong", 
      "D": "Why option D is wrong"
    }
  },
  "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3"]
}

Important guidelines:
- Include 3-5 steps in the concept breakdown
- Use LaTeX notation for ALL mathematical expressions
- Make the worked example realistic with actual numbers
- The MCQ should test conceptual understanding, not just memorization
- Explain each wrong answer thoroughly so students understand common misconceptions
- Keep language clear and accessible for students preparing for competitive exams`;

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
          { role: "user", content: `Explain the topic: "${topic}" for JEE/NEET preparation. Provide a comprehensive breakdown following the exact JSON structure specified.` }
        ],
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the JSON from the response
    let parsedContent;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      // Return raw content if parsing fails
      return new Response(JSON.stringify({ rawContent: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
