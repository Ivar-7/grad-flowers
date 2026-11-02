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
