import { describe, expect, it } from "vitest";

import {
  redactSensitiveText,
  safeErrorMessage,
  safeLogDetails,
  safeServerErrorMessage,
} from "./safe-error";

describe("safe error helpers", () => {
  it("redacts provider tokens and local paths", () => {
    const message =
      "provider failed with sk-live-secret-token and hf_abcdefghijklmnop at /Users/demo/project";

    const redacted = redactSensitiveText(message);

    expect(redacted).not.toContain("sk-live-secret-token");
    expect(redacted).not.toContain("hf_abcdefghijklmnop");
    expect(redacted).not.toContain("/Users/demo/project");
    expect(redacted).toContain("[redacted]");
  });

  it("allows known safe server messages", () => {
    expect(safeServerErrorMessage("Generated explanation was incomplete. Please try again.")).toBe(
      "Generated explanation was incomplete. Please try again.",
    );
  });

  it("sanitizes unknown server messages before showing them to learners", () => {
    expect(
      safeServerErrorMessage("upstream failed with AIzaSySecretSecretSecret at /private/tmp/run"),
    ).toBe("upstream failed with [redacted] at [redacted]");
  });

  it("does not include raw error messages in log metadata", () => {
    const details = safeLogDetails(new Error("provider failed with sk-live-secret-token"));

    expect(details).toEqual({ name: "Error" });
    expect(JSON.stringify(details)).not.toContain("sk-live-secret-token");
  });

  it("uses a safe fallback for non-error values", () => {
    expect(safeErrorMessage(null)).toBe("Something went wrong. Please try again.");
  });
});
