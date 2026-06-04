export interface ExplanationData {
  title: string;
  overview: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
  }>;
  workedExample: {
    problem: string;
    given: string[];
    toFind: string;
    solution: Array<{
      step: number;
      explanation: string;
      calculation: string;
    }>;
    answer: string;
  };
  mcq: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    wrongAnswerExplanations: Record<string, string>;
  };
  keyTakeaways: string[];
}

export const MAX_TOPIC_LENGTH = 120;
const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown, minItems: number, maxItems: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minItems &&
    value.length <= maxItems &&
    value.every(isNonEmptyString)
  );
}

export function normalizeTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

export function isValidTopic(topic: string): boolean {
  const normalized = normalizeTopic(topic);
  return normalized.length > 0 && normalized.length <= MAX_TOPIC_LENGTH;
}

export function isExplanationData(value: unknown): value is ExplanationData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<ExplanationData>;
  const steps = data.steps;
  const workedExample = data.workedExample;
  const mcq = data.mcq;

  if (!isNonEmptyString(data.title) || !isNonEmptyString(data.overview)) return false;
  if (!Array.isArray(steps) || steps.length < 3 || steps.length > 5) return false;
  if (!steps.every((step, index) => (
    Number.isFinite(step?.stepNumber) &&
    step.stepNumber === index + 1 &&
    isNonEmptyString(step.title) &&
    isNonEmptyString(step.content)
  ))) {
    return false;
  }

  if (!workedExample || typeof workedExample !== "object") return false;
  if (
    !isNonEmptyString(workedExample.problem) ||
    !isStringArray(workedExample.given, 1, 8) ||
    !isNonEmptyString(workedExample.toFind) ||
    !Array.isArray(workedExample.solution) ||
    workedExample.solution.length < 1 ||
    workedExample.solution.length > 8 ||
    !isNonEmptyString(workedExample.answer)
  ) {
    return false;
  }
  if (!workedExample.solution.every((step, index) => (
    Number.isFinite(step?.step) &&
    step.step === index + 1 &&
    isNonEmptyString(step.explanation) &&
    isNonEmptyString(step.calculation)
  ))) {
    return false;
  }

  if (!mcq || typeof mcq !== "object") return false;
  if (
    !isNonEmptyString(mcq.question) ||
    !isStringArray(mcq.options, 4, 4) ||
    !VALID_ANSWERS.has(mcq.correctAnswer) ||
    !isNonEmptyString(mcq.explanation) ||
    !mcq.wrongAnswerExplanations ||
    typeof mcq.wrongAnswerExplanations !== "object"
  ) {
    return false;
  }

  const wrongAnswerKeys = ["A", "B", "C", "D"].filter((option) => option !== mcq.correctAnswer);
  if (!wrongAnswerKeys.every((option) => isNonEmptyString(mcq.wrongAnswerExplanations[option]))) {
    return false;
  }

  return isStringArray(data.keyTakeaways, 3, 5);
}
