import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import CourtsPage from '@/pages/CourtsPage'
import DashboardPage from '@/pages/DashboardPage'
import MyReservationsPage from '@/pages/MyReservationsPage'
import ReservationsPage from '@/pages/ReservationsPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/quadras', element: <CourtsPage /> },
      { path: '/reservas', element: <ReservationsPage /> },
      { path: '/minhas-reservas', element: <MyReservationsPage /> },
    ],
  },
])