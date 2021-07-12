import { formatTitleCase } from "../../src/utils/format";

describe("String format tests", () => {
  it("should return title case", () => {
    const formatted: string = formatTitleCase("example");
    const formattedCaps: string = formatTitleCase("CAPS");
    const formattedMulti: string = formatTitleCase("format multiple words");
    expect(formatted).toEqual("Example");
    expect(formattedCaps).toEqual("Caps");
    expect(formattedMulti).toEqual("Format Multiple Words");
  });
});
