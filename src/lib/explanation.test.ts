import { describe, expect, it } from "vitest";
import {
  MAX_OPTION_LENGTH,
  MAX_TEXT_FIELD_LENGTH,
  isExplanationData,
  isValidTopic,
  normalizeTopic,
} from "./explanation";

const validExplanation = {
  title: "Newton's Laws",
  overview: "A short overview of motion and force.",
  steps: [
    { stepNumber: 1, title: "First law", content: "Objects resist changes in motion." },
    { stepNumber: 2, title: "Second law", content: "Force changes momentum." },
    { stepNumber: 3, title: "Third law", content: "For every action there is a reaction." },
  ],
  workedExample: {
    problem: "Find acceleration when $F = 10N$ and $m = 2kg$.",
    given: ["$F = 10N$", "$m = 2kg$"],
    toFind: "$a$",
    solution: [
      {
        step: 1,
        explanation: "Use Newton's second law.",
        calculation: "$a = F / m = 5m/s^2$",
      },
    ],
    answer: "$5m/s^2$",
  },
  mcq: {
    question: "Which law defines $F = ma$?",
    options: ["A. First", "B. Second", "C. Third", "D. Zeroth"],
    correctAnswer: "B",
    explanation: "The second law relates net force and acceleration.",
    wrongAnswerExplanations: {
      A: "The first law describes inertia.",
      C: "The third law describes force pairs.",
      D: "There is no Newton's zeroth law.",
    },
  },
  keyTakeaways: ["Forces change motion.", "$F = ma$.", "Free body diagrams help."],
};

describe("explanation validation", () => {
  it("accepts complete generated explanation payloads", () => {
    expect(isExplanationData(validExplanation)).toBe(true);
  });

  it("rejects incomplete MCQ explanations", () => {
    const incomplete = {
      ...validExplanation,
      mcq: {
        ...validExplanation.mcq,
        wrongAnswerExplanations: { A: "Wrong", C: "Wrong" },
      },
    };

    expect(isExplanationData(incomplete)).toBe(false);
  });

  it("rejects out-of-order concept steps", () => {
    const outOfOrder = {
      ...validExplanation,
      steps: [
        validExplanation.steps[0],
        { ...validExplanation.steps[1], stepNumber: 4 },
        validExplanation.steps[2],
      ],
    };

    expect(isExplanationData(outOfOrder)).toBe(false);
  });

  it("rejects oversized generated text fields", () => {
    const oversized = {
      ...validExplanation,
      steps: [
        {
          ...validExplanation.steps[0],
          content: "x".repeat(MAX_TEXT_FIELD_LENGTH + 1),
        },
        validExplanation.steps[1],
        validExplanation.steps[2],
      ],
    };

    expect(isExplanationData(oversized)).toBe(false);
  });

  it("rejects oversized MCQ options", () => {
    const oversized = {
      ...validExplanation,
      mcq: {
        ...validExplanation.mcq,
        options: [
          "A. " + "x".repeat(MAX_OPTION_LENGTH + 1),
          ...validExplanation.mcq.options.slice(1),
        ],
      },
    };

    expect(isExplanationData(oversized)).toBe(false);
  });

  it("normalizes and validates topic text", () => {
    expect(normalizeTopic("  Current    Electricity  ")).toBe("Current Electricity");
    expect(isValidTopic("  Current Electricity  ")).toBe(true);
    expect(isValidTopic(" ".repeat(4))).toBe(false);
    expect(isValidTopic("x".repeat(121))).toBe(false);
  });
});
