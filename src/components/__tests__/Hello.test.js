import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Hello from '../Hello';

test('Hiển thị tên đúng', () => {
  render(<Hello />);
  const input = screen.getByPlaceholderText('Nhập tên của bạn');
  fireEvent.change(input, { target: { value: 'Huy' } });

  expect(screen.getByText('Hello, Huy!')).toBeInTheDocument();
});
