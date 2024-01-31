import { act, renderHook } from "@testing-library/react";
import { useBoolean } from "./boolean";

describe("useBoolean Hook", () => {
  test("should initialize with the correct initial state", () => {
    const { result } = renderHook(() => useBoolean(true));
    const [state] = result.current;

    expect(state).toBe(true);
  });

  test("should provide callbacks to update the boolean state", () => {
    const { result } = renderHook(() => useBoolean(false));
    const [, callbacks] = result.current;

    act(() => {
      callbacks.on();
    });
    expect(result.current[1].on).toBeDefined();
    expect(result.current[0]).toBe(true);

    act(() => {
      callbacks.off();
    });
    expect(result.current[1].off).toBeDefined();
    expect(result.current[0]).toBe(false);

    act(() => {
      callbacks.toggle();
    });
    expect(result.current[1].toggle).toBeDefined();
    expect(result.current[0]).toBe(true);

    act(() => {
      callbacks.set(true);
    });
    expect(result.current[1].set).toBeDefined();
    expect(result.current[0]).toBe(true);
  });

  test("should toggle the boolean state correctly", () => {
    const { result } = renderHook(() => useBoolean());
    const [, callbacks] = result.current;

    act(() => {
      callbacks.toggle();
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      callbacks.toggle();
    });
    expect(result.current[0]).toBe(false);
  });

  test("should set the boolean state correctly", () => {
    const { result } = renderHook(() => useBoolean());
    const [, callbacks] = result.current;

    act(() => {
      callbacks.set(true);
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      callbacks.set(false);
    });
    expect(result.current[0]).toBe(false);
  });
});
