import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main menu title', () => {
  render(<App />);
  expect(screen.getByText(/EL PALACIO DE LOS ESPEJOS/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Entrar al Palacio/i })).toBeInTheDocument();
});
