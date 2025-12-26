import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import TaskComplete from './pages/TaskComplete'
import Rewards from './pages/Rewards'
import RewardDetail from './pages/RewardDetail'
import Notifications from './pages/Notifications'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="giris" element={<Login />} />
        <Route path="kayit" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="gorevler" element={<Tasks />} />
            <Route path="gorevler/:id" element={<TaskDetail />} />
            <Route path="gorevler/:id/tamamla" element={<TaskComplete />} />
            <Route path="oduller" element={<Rewards />} />
            <Route path="oduller/:id" element={<RewardDetail />} />
            <Route path="bildirimler" element={<Notifications />} />
            <Route path="mesajlar" element={<Messages />} />
            <Route path="profil" element={<Profile />} />
            <Route path="profil/:id" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
