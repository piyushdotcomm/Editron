import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EnvManager } from "../modules/playground/components/env-manager";

// Mock the Sidebar UI dependencies to prevent rendering errors
vi.mock("@/components/ui/sidebar", () => ({
  SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  SidebarGroupContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
  SidebarGroupLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, title }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string; title?: string }) => (
    <button onClick={onClick} disabled={disabled} className={className} title={title}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ value, onChange, placeholder, className, type }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; className?: string; type?: string }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      type={type}
    />
  ),
}));

describe("EnvManager Component", () => {
  const writeFileSyncMock = vi.fn().mockResolvedValue(undefined);
  const instanceMock = {};
  const emptyTemplateData = { items: [] };

  it("should render correctly with empty env variables", () => {
    render(
      <EnvManager
        templateData={emptyTemplateData}
        instance={instanceMock}
        writeFileSync={writeFileSyncMock}
      />
    );

    expect(screen.getByText("No variables defined")).toBeDefined();
    expect(screen.getByText("Add your first variable")).toBeDefined();
  });

  it("should allow adding a new variable and format the key on-the-fly", async () => {
    render(
      <EnvManager
        templateData={emptyTemplateData}
        instance={instanceMock}
        writeFileSync={writeFileSyncMock}
      />
    );

    const addButton = screen.getByText("Add your first variable");
    fireEvent.click(addButton);

    const keyInput = screen.getByPlaceholderText("API_KEY");
    
    // Test lowercase to uppercase and spaces/hyphens to underscore formatting
    fireEvent.change(keyInput, { target: { value: "my-cool api-key" } });
    expect(keyInput.value).toBe("MY_COOL_API_KEY");
  });

  it("should show validation errors and disable save button on invalid keys", () => {
    render(
      <EnvManager
        templateData={emptyTemplateData}
        instance={instanceMock}
        writeFileSync={writeFileSyncMock}
      />
    );

    const addButton = screen.getByTitle("Add Variable");
    fireEvent.click(addButton);

    const keyInput = screen.getByPlaceholderText("API_KEY");
    
    // "!" is invalid in POSIX
    fireEvent.change(keyInput, { target: { value: "INVALID_KEY!" } });
    expect(keyInput.value).toBe("INVALID_KEY!");

    expect(screen.getByText("A-Z, 0-9, _ only, must start with letter/_")).toBeDefined();
    expect(screen.getByText("⚠️ Fix invalid key formats.")).toBeDefined();

    const saveButton = screen.getByText("Save to .env");
    expect(saveButton).toBeDisabled();
  });

  it("should show validation error and disable save button on duplicate keys", () => {
    render(
      <EnvManager
        templateData={emptyTemplateData}
        instance={instanceMock}
        writeFileSync={writeFileSyncMock}
      />
    );

    // Add first variable
    const addButton = screen.getByTitle("Add Variable");
    fireEvent.click(addButton);
    const inputs = screen.getAllByPlaceholderText("API_KEY");
    fireEvent.change(inputs[0], { target: { value: "PORT" } });

    // Add second variable
    fireEvent.click(addButton);
    const newInputs = screen.getAllByPlaceholderText("API_KEY");
    fireEvent.change(newInputs[1], { target: { value: "PORT" } });

    expect(screen.getAllByText("Duplicate key name").length).toBe(2);
    expect(screen.getByText("⚠️ Duplicate keys are not allowed.")).toBeDefined();

    const saveButton = screen.getByText("Save to .env");
    expect(saveButton).toBeDisabled();
  });

  it("should show warning and disable save button if any key is empty", () => {
    render(
      <EnvManager
        templateData={emptyTemplateData}
        instance={instanceMock}
        writeFileSync={writeFileSyncMock}
      />
    );

    // Add a variable (will start empty)
    const addButton = screen.getByTitle("Add Variable");
    fireEvent.click(addButton);

    expect(screen.getByText("⚠️ All keys must be filled.")).toBeDefined();

    const saveButton = screen.getByText("Save to .env");
    expect(saveButton).toBeDisabled();
  });
});
