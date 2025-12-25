import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main menu title', () => {
  render(<App />);
  const titleElement = screen.getByText(/EL PALACIO DE LOS VERBOS IRREGULARES/i);
  expect(titleElement).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Entrar al Palacio/i })).toBeInTheDocument();
});
