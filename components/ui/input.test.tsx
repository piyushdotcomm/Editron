import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input } from "./input";

describe("Input component", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter name" />);
    
    const input = screen.getByPlaceholderText(/enter name/i);

    expect(input).toBeInTheDocument();
  });

  it("accepts text input", () => {
    render(<Input placeholder="Username" />);

    const input = screen.getByPlaceholderText(/username/i);

    expect(input).toHaveAttribute("placeholder", "Username");
  });

  it("can be disabled", () => {
    render(<Input disabled placeholder="Disabled input" />);

    const input = screen.getByPlaceholderText(/disabled input/i);

    expect(input).toBeDisabled();
  });
});