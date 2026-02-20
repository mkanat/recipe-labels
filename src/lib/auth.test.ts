import { describe, it, expect } from "vitest";
import { auth } from "./auth";

describe("Better Auth Configuration", () => {
  it("should be initialized without crashing", () => {
    expect(auth).toBeDefined();
    // Assuming better-auth exposes these methods on the initialized object
    expect(auth.api).toBeDefined();
  });
});
