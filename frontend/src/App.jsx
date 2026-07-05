import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from './components/common/AppShell'
import GuestRoute from './components/common/GuestRoute'
import Loading from './components/common/Loading'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicShell from './components/common/PublicShell'
import ScrollToTop from './components/common/ScrollToTop'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const GiftList = lazy(() => import('./pages/giftlists/GiftList'))
const GiftListForm = lazy(() => import('./pages/giftlists/GiftListForm'))
const GiftListDetail = lazy(() => import('./pages/giftlists/GiftListDetail'))
const GiftItemForm = lazy(() => import('./pages/giftitems/GiftItemForm'))
const GiftReceived = lazy(() => import('./pages/gifts/GiftReceived'))
const Friends = lazy(() => import('./pages/friends/Friends'))
const Profile = lazy(() => import('./pages/profile/Profile'))
const Sessions = lazy(() => import('./pages/profile/Sessions'))
const PublicGiftList = lazy(() => import('./pages/public/PublicGiftList'))

const App = () => (
  <Suspense fallback={<Loading />}>
    <ScrollToTop />
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/lists" replace />} />
          <Route path="/lists" element={<GiftList />} />
          <Route path="/lists/new" element={<GiftListForm />} />
          <Route path="/lists/:listId" element={<GiftListDetail />} />
          <Route path="/lists/:listId/edit" element={<GiftListForm />} />
          <Route path="/lists/:listId/items/new" element={<GiftItemForm />} />
          <Route path="/items/:itemId/edit" element={<GiftItemForm />} />
          <Route path="/gifts/received" element={<GiftReceived />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sessions" element={<Sessions />} />
        </Route>
      </Route>

      <Route element={<PublicShell />}>
        <Route path="/g/:code" element={<PublicGiftList />} />
      </Route>

      <Route path="*" element={<Navigate to="/lists" replace />} />
    </Routes>
  </Suspense>
)

export default App
