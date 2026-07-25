import { describe, it, expect } from "vitest";
import { encodeJsonColumn, decodeJsonColumn } from "./jsonColumn.js";

describe("jsonColumn", () => {
  it("encodes an array to JSON string", () => {
    expect(encodeJsonColumn(["a", "b", "c"])).toBe('["a","b","c"]');
  });

  it("decodes a valid JSON string to array", () => {
    expect(decodeJsonColumn('["a","b","c"]')).toEqual(["a", "b", "c"]);
  });

  it("returns empty array for malformed JSON", () => {
    expect(decodeJsonColumn("not-json")).toEqual([]);
  });

  it("returns empty array for null input", () => {
    expect(decodeJsonColumn("null")).toEqual([]);
  });

  it("returns empty array for object input", () => {
    expect(decodeJsonColumn('{"key":"value"}')).toEqual([]);
  });

  it("filters out non-string values", () => {
    expect(decodeJsonColumn('["a", 1, true, "b"]')).toEqual(["a", "b"]);
  });

  it("handles empty array", () => {
    expect(decodeJsonColumn("[]")).toEqual([]);
    expect(encodeJsonColumn([])).toBe("[]");
  });
});
