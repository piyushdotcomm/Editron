import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./tabs";

describe("Tabs component", () => {
  it("renders tabs correctly", () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          Account Content
        </TabsContent>

        <TabsContent value="password">
          Password Content
        </TabsContent>
      </Tabs>
    );

    expect(
      screen.getByRole("tab", { name: /account/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", { name: /password/i })
    ).toBeInTheDocument();
  });

  it("shows default tab content", () => {
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          Account Content
        </TabsContent>

        <TabsContent value="password">
          Password Content
        </TabsContent>
      </Tabs>
    );

    expect(
      screen.getByText(/account content/i)
    ).toBeInTheDocument();
  });
});