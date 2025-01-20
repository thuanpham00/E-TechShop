import { useRoutes } from "react-router-dom"
import { lazy, Suspense } from "react"
import MainLayoutAdmin from "../Layouts/MainLayoutAdmin"
import { path } from "src/Constants/path"

const Home = lazy(() => import("src/Admin/Pages/Home"))

export default function useRouterAdmin() {
  const useRouterElement = useRoutes([
    {
      path: "",
      element: <MainLayoutAdmin />,
      children: [
        {
          path: path.Admin,
          element: (
            <Suspense>
              <Home />
            </Suspense>
          )
        }
      ]
    }
  ])
  return useRouterElement
}
