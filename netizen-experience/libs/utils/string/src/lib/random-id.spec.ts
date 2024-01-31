import { randomId } from "./random-id";

describe("randomId", () => {
  test("should generate a 12-digit random ID", () => {
    const id = randomId();

    expect(id).toHaveLength(12);
    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
  });
});
