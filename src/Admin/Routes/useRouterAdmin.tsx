import { useRoutes } from "react-router-dom"
import { lazy, Suspense } from "react"

const Home = lazy(() => import("src/Admin/Pages/Home"))

export default function useRouterAdmin() {
  const useRouterElement = useRoutes([
    {
      path: "/Admin/Home",
      element: (
        <Suspense>
          <Home />
        </Suspense>
      )
    }
  ])
  return useRouterElement
}
