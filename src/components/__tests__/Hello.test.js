// src/components/__tests__/Hello.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Hello from '../Hello';

test('renders with name', () => {
  render(<Hello name="Huy" />);
  const element = screen.getByText(/Hello, Huy!/i);
  expect(element).toBeInTheDocument();
});
