import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { NotFoundPage } from '@/shared/ui/NotFoundPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import('@/features/home/pages/HomePage')
          return { Component: module.HomePage }
        },
      },
      {
        path: 'flowers',
        lazy: async () => {
          const module = await import('@/features/flowers/pages/FlowersPage')
          return { Component: module.FlowersPage }
        },
      },
      {
        path: 'flowers/:id',
        lazy: async () => {
          const module =
            await import('@/features/flowers/pages/FlowerDetailPage')
          return { Component: module.FlowerDetailPage }
        },
      },
      {
        path: 'cart',
        lazy: async () => {
          const module = await import('@/features/cart/pages/CartPage')
          return { Component: module.CartPage }
        },
      },
      {
        path: 'checkout',
        lazy: async () => {
          const module = await import('@/features/checkout/pages/CheckoutPage')
          return { Component: module.CheckoutPage }
        },
      },
      {
        path: 'order-success/:orderId',
        lazy: async () => {
          const module =
            await import('@/features/checkout/pages/OrderSuccessPage')
          return { Component: module.OrderSuccessPage }
        },
      },
      {
        path: 'orders',
        lazy: async () => {
          const module = await import('@/features/orders/pages/OrdersPage')
          return { Component: module.OrdersPage }
        },
      },
      {
        path: 'leads',
        lazy: async () => {
          const module = await import('@/features/leads/pages/LeadsPage')
          return { Component: module.LeadsPage }
        },
      },
      {
        path: 'staff',
        lazy: async () => {
          const module =
            await import('@/features/staff/pages/StaffDashboardPage')
          return { Component: module.StaffDashboardPage }
        },
      },
      {
        path: 'qr/:id',
        lazy: async () => {
          const module = await import('@/features/qr/pages/QrMessagePage')
          return { Component: module.QrMessagePage }
        },
      },
      {
        path: 'auth',
        lazy: async () => {
          const module = await import('@/features/auth/pages/AuthPage')
          return { Component: module.AuthPage }
        },
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
