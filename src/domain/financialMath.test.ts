import { describe, it, expect } from "vitest";
import { calculateAccountBalance, calculateNetCashFlow } from "./financialMaths";

describe("Financial Math", () => {
  it("calculates account balance correctly", () => {
    expect(calculateAccountBalance(100, 50, 30)).toBe(120);
    expect(calculateAccountBalance(0, 200, 50)).toBe(150);
    expect(calculateAccountBalance(100, 0, 150)).toBe(-50);
  });

  it("calculates net cash flow correctly", () => {
    expect(calculateNetCashFlow(500, 200)).toBe(300);
    expect(calculateNetCashFlow(100, 100)).toBe(0);
    expect(calculateNetCashFlow(50, 150)).toBe(-100);
  });

  it("handles floating point precision correctly", () => {
    expect(calculateAccountBalance(0.1, 0.2, 0)).toBe(0.3);
  });
});
