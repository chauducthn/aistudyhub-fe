import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockLogin = vi.fn()
vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
  })
}))

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    renderWithRouter(<LoginPage />)
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument()
  })

  it('shows error if login fails', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Login failed' } }
    })
    
    renderWithRouter(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }))

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument()
    })
  })

  it('calls login function on submit', async () => {
    mockLogin.mockResolvedValue({ user: { role: 'USER' } })
    
    renderWithRouter(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@university.edu' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'securepassword' } })
    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'user@university.edu', password: 'securepassword' })
    })
  })
})
