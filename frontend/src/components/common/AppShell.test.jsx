import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import AppShell from './AppShell'
import RetryState from './RetryState'

const LocationView = () => {
  const location = useLocation()
  return <div>{location.pathname + location.search}</div>
}

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

    expect(screen.getByRole('link', { name: /yourz/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lists/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^friends$/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Notifications')).not.toBeInTheDocument()
    expect(screen.getByText('Lists page')).toBeInTheDocument()
  })

  it('opens list navigation dropdown', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /lists/i }))

    expect(screen.getByRole('menuitem', { name: /my lists/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /friends' lists/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /create list/i })).toBeInTheDocument()
  })

  it('toggles mobile navigation panel', async () => {
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

    const menuButton = screen.getByRole('button', { name: 'Open navigation' })

    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(menuButton)
    await userEvent.click(screen.getByRole('button', { name: /lists/i }))
    expect(screen.getByRole('menuitem', { name: /my lists/i })).toBeInTheDocument()
  })

  it('submits header search to gift list query', async () => {
    render(
      <AuthContext.Provider value={{ logout: vi.fn() }}>
        <MemoryRouter initialEntries={['/app/lists']}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/app/lists" element={<LocationView />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    await userEvent.click(screen.getByRole('button', { name: /search/i }))
    await userEvent.type(screen.getByPlaceholderText('Search wish lists'), 'birthday')
    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('/app/lists?search=birthday')).toBeInTheDocument()
  })

  it('renders retry state action', () => {
    render(<RetryState message="Cannot load" onRetry={vi.fn()} />)

    expect(screen.getByText('Cannot load')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})
