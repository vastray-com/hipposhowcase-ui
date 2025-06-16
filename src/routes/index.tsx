import { ResultPage } from '@/components/ErrorPage.tsx'
import { Layout } from '@/components/Layout.tsx'
import CustomerPage from '@/pages/Customer/Customer.tsx'
import LoginPage from '@/pages/Login/Login.tsx'
import SelectCustomerPage from '@/pages/SelectCustomer/SelectCustomer.tsx'
import { routerLoader } from '@/routes/loader.ts'
import { createBrowserRouter } from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    loader: routerLoader.redirectLoader,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <Layout />,
        children: [
          {
            path: '/select-customer',
            element: <SelectCustomerPage />,
          },
          {
            path: '/note/:noteId',
            element: <CustomerPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <ResultPage.NotFound />,
  },
])

export default router
