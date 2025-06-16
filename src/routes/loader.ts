import type { LoaderFunction } from 'react-router-dom'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { redirect } from 'react-router-dom'

const redirectLoader: LoaderFunction = ({ request }) => {
  const path = new URL(request.url).pathname
  const cachedToken = ls.get(LS_KEY.ACCESS_TOKEN)

  switch (path) {
    case '/':
      if (cachedToken !== null) {
        return redirect('/select-customer')
      }
      return redirect('/login')
    case '/login':
      if (cachedToken !== null) {
        return redirect('/select-customer')
      }
      break
    default:
      if (cachedToken === null) {
        return redirect('/login')
      }
      break
  }

  return null
}

export const routerLoader = {
  redirectLoader,
}
