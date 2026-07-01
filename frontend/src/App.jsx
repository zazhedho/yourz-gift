import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from './components/common/AppShell'
import GuestRoute from './components/common/GuestRoute'
import Loading from './components/common/Loading'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicShell from './components/common/PublicShell'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const GiftList = lazy(() => import('./pages/giftlists/GiftList'))
const GiftListForm = lazy(() => import('./pages/giftlists/GiftListForm'))
const GiftListDetail = lazy(() => import('./pages/giftlists/GiftListDetail'))
const GiftItemForm = lazy(() => import('./pages/giftitems/GiftItemForm'))
const PublicGiftList = lazy(() => import('./pages/public/PublicGiftList'))

const App = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/app/lists" replace />} />
          <Route path="/app/lists" element={<GiftList />} />
          <Route path="/app/lists/new" element={<GiftListForm />} />
          <Route path="/app/lists/:listId" element={<GiftListDetail />} />
          <Route path="/app/lists/:listId/edit" element={<GiftListForm />} />
          <Route path="/app/lists/:listId/items/new" element={<GiftItemForm />} />
          <Route path="/app/items/:itemId/edit" element={<GiftItemForm />} />
        </Route>
      </Route>

      <Route element={<PublicShell />}>
        <Route path="/g/:code" element={<PublicGiftList />} />
      </Route>

      <Route path="*" element={<Navigate to="/app/lists" replace />} />
    </Routes>
  </Suspense>
)

export default App
