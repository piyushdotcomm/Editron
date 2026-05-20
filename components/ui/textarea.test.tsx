import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea component", () => {
  it("renders correctly", () => {
    render(<Textarea placeholder="Write message" />);

    const textarea = screen.getByPlaceholderText(/write message/i);

    expect(textarea).toBeInTheDocument();
  });

  it("accepts placeholder text", () => {
    render(<Textarea placeholder="Type here" />);

    const textarea = screen.getByPlaceholderText(/type here/i);

    expect(textarea).toHaveAttribute("placeholder", "Type here");
  });

  it("can be disabled", () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);

    const textarea = screen.getByPlaceholderText(/disabled textarea/i);

    expect(textarea).toBeDisabled();
  });
});