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
export const MAX_TEXT_FIELD_LENGTH = 1_500;
export const MAX_OPTION_LENGTH = 300;
const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);

function isBoundedString(
  value: unknown,
  maxLength: number = MAX_TEXT_FIELD_LENGTH,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isStringArray(
  value: unknown,
  minItems: number,
  maxItems: number,
  maxItemLength: number = MAX_TEXT_FIELD_LENGTH,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minItems &&
    value.length <= maxItems &&
    value.every((item) => isBoundedString(item, maxItemLength))
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

  if (!isBoundedString(data.title, 180) || !isBoundedString(data.overview)) return false;
  if (!Array.isArray(steps) || steps.length < 3 || steps.length > 5) return false;
  if (!steps.every((step, index) => (
    Number.isFinite(step?.stepNumber) &&
    step.stepNumber === index + 1 &&
    isBoundedString(step.title, 180) &&
    isBoundedString(step.content)
  ))) {
    return false;
  }

  if (!workedExample || typeof workedExample !== "object") return false;
  if (
    !isBoundedString(workedExample.problem) ||
    !isStringArray(workedExample.given, 1, 8) ||
    !isBoundedString(workedExample.toFind, 300) ||
    !Array.isArray(workedExample.solution) ||
    workedExample.solution.length < 1 ||
    workedExample.solution.length > 8 ||
    !isBoundedString(workedExample.answer)
  ) {
    return false;
  }
  if (!workedExample.solution.every((step, index) => (
    Number.isFinite(step?.step) &&
    step.step === index + 1 &&
    isBoundedString(step.explanation) &&
    isBoundedString(step.calculation)
  ))) {
    return false;
  }

  if (!mcq || typeof mcq !== "object") return false;
  if (
    !isBoundedString(mcq.question) ||
    !isStringArray(mcq.options, 4, 4, MAX_OPTION_LENGTH) ||
    !VALID_ANSWERS.has(mcq.correctAnswer) ||
    !isBoundedString(mcq.explanation) ||
    !mcq.wrongAnswerExplanations ||
    typeof mcq.wrongAnswerExplanations !== "object"
  ) {
    return false;
  }

  const wrongAnswerKeys = ["A", "B", "C", "D"].filter((option) => option !== mcq.correctAnswer);
  if (!wrongAnswerKeys.every((option) => isBoundedString(mcq.wrongAnswerExplanations[option]))) {
    return false;
  }

  return isStringArray(data.keyTakeaways, 3, 5);
}
