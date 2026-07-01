import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import AppShell from './AppShell'
import RetryState from './RetryState'

describe('common components', () => {
  it('renders owner shell navigation', () => {
    render(
      <AuthContext.Provider value={{ logout: vi.fn() }}>
        <MemoryRouter initialEntries={['/app/lists']}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/app/lists" element={<div>Lists page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(screen.getByText('Yourz Gift')).toBeInTheDocument()
    expect(screen.getByText('Gift Lists')).toBeInTheDocument()
    expect(screen.getByText('Lists page')).toBeInTheDocument()
  })

  it('renders retry state action', () => {
    render(<RetryState message="Cannot load" onRetry={vi.fn()} />)

    expect(screen.getByText('Cannot load')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
