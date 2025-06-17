import { render, screen } from '@testing-library/react';
import Hello from '../Hello';

test('Hiển thị tên đúng', () => {
  render(<Hello name="Huy" />);
  expect(screen.getByText('Hello, Huy!')).toBeInTheDocument();
});
