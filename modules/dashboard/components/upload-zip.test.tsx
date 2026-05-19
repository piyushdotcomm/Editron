import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UploadZip from "./upload-zip";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("UploadZip", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the upload card as an accessible button", () => {
    render(<UploadZip />);

    const button = screen.getByRole("button", { name: /upload zip/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAccessibleDescription("Import a project from a ZIP file");
  });

  it("opens the hidden file input when activated", () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    render(<UploadZip />);

    fireEvent.click(screen.getByRole("button", { name: /upload zip/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
