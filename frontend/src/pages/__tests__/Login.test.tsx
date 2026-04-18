import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../lib/auth';
import Login from '../../pages/Login';

vi.mock('../../lib/api', () => ({
  authApi: {
    login: vi.fn(),
    signup: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
  },
}));

const MockLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Page', () => {
  it('renders email and password inputs', () => {
    render(<MockLogin />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(<MockLogin />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders a link to signup', () => {
    render(<MockLogin />);
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });
});