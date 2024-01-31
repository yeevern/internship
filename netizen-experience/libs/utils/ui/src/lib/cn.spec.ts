import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cn } from "./cn";

jest.mock("clsx");
jest.mock("tailwind-merge");

describe("cn", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should merge classes with clsx conditionally and twMerge", () => {
    const input = ["px-2 pt-1", { "p-4": true }, ["m-4"], true && "text-neutral"];
    const clsxOutput = "px-2 pt-1 p-4 m-4 text-neutral";
    const twMergeOutput = "p-4 m-4 text-neutral";
    jest.mocked(clsx).mockReturnValueOnce(clsxOutput);
    jest.mocked(twMerge).mockReturnValueOnce(twMergeOutput);

    const result = cn(...input);

    expect(clsx).toHaveBeenCalledWith(input);
    expect(twMerge).toHaveBeenCalledWith(clsxOutput);
    expect(result).toBe(twMergeOutput);
  });
});
