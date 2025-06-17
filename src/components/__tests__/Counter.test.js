import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "../Counter";

test("Ban đầu count = 0", () => {
  render(<Counter />);
  expect(screen.getByTestId("count")).toHaveTextContent("Count: 0");
});

test("Tăng count khi bấm nút", () => {
  render(<Counter />);
  const button = screen.getByText("Increase");
  fireEvent.click(button);
  expect(screen.getByTestId("count")).toHaveTextContent("Count: 1");
});
