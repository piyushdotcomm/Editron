/**
 * @vitest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";

describe("useUnsavedChangesWarning", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("does not block unload when there are no unsaved changes", () => {
    renderHook(() => useUnsavedChangesWarning(false));

    const event = new Event("beforeunload", { cancelable: true });

    expect(window.dispatchEvent(event)).toBe(true);
    expect(event.defaultPrevented).toBe(false);
  });

  it("blocks unload when there are unsaved changes", () => {
    renderHook(() => useUnsavedChangesWarning(true));

    const event = new Event("beforeunload", { cancelable: true });

    expect(window.dispatchEvent(event)).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });

  it("prevents guarded navigation when the user cancels", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderHook(() => useUnsavedChangesWarning(true));

    const link = document.createElement("a");
    link.href = "/dashboard";
    document.body.appendChild(link);

    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });

    expect(link.dispatchEvent(event)).toBe(false);
    expect(event.defaultPrevented).toBe(true);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it("returns a confirmNavigation helper for imperative exits", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { result } = renderHook(() => useUnsavedChangesWarning(true));

    expect(result.current.confirmNavigation()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it("allows imperative exits when the user confirms", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const { result } = renderHook(() => useUnsavedChangesWarning(true));

    expect(result.current.confirmNavigation()).toBe(true);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });
});
