import router from '@/routes'
import { App, ConfigProvider } from 'antd'
import { RouterProvider } from 'react-router'

function Root() {
  return (
    <ConfigProvider>
      <App className="pos-relative h-full w-full">
        <RouterProvider router={router} />
      </App>
    </ConfigProvider>
  )
}

export default Root
