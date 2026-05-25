import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CommandDialog, CommandInput, CommandList } from "./command";

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("CommandDialog", () => {
  it("does not render dialog metadata while closed", () => {
    render(
      <CommandDialog open={false} onOpenChange={() => {}}>
        <CommandInput />
        <CommandList />
      </CommandDialog>,
    );

    expect(screen.queryByText("Command Palette")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Search for a command to run..."),
    ).not.toBeInTheDocument();
  });

  it("renders dialog metadata when open", () => {
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput />
        <CommandList />
      </CommandDialog>,
    );

    expect(screen.getByText("Command Palette")).toBeInTheDocument();
    expect(
      screen.getByText("Search for a command to run..."),
    ).toBeInTheDocument();
  });
});
