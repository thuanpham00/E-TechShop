import CategoryItem from "../CategoryItem"
import CategoryDetail from "../CategoryDetail"
import { useCallback, useContext, useState } from "react"
import { AppContext } from "src/Context/authContext"
import { categories } from "src/Client/Constants/categories"

export default function MenuCategory() {
  const { isShowCategory, setIsShowCategory } = useContext(AppContext)
  const [showCategoryDetail, setShowCategoryDetail] = useState<string>("")
  const [isHover, setIsHover] = useState(false)

  const handleExitLayout = useCallback(() => {
    setIsShowCategory(false)
  }, [setIsShowCategory])

  const handleCategory = useCallback((index: string) => {
    setShowCategoryDetail(index)
    setIsHover(true)
  }, [])

  const handleExitCategory = useCallback(() => {
    setShowCategoryDetail("")
    setIsHover(false)
  }, [])

  return (
    <div>
      {isShowCategory && (
        <button
          onClick={handleExitLayout}
          className="fixed left-0 top-[74px] z-30 w-screen h-screen bg-black/60"
        ></button>
      )}
      {isShowCategory && (
        <div className="container">
          <div
            onMouseLeave={handleExitCategory}
            className={`grid grid-cols-12 gap-2 ${isHover && "top-[90px] z-40 fixed"}`}
          >
            <div className={`col-span-2 ${!isHover && "top-[90px] z-40 fixed"}`}>
              {categories.map((category) => (
                <div
                  onMouseEnter={() => handleCategory(category.index)}
                  key={category.index}
                  className={`pl-3 pr-2 pt-2 pb-[6px] shadow first:rounded-tl-[4px] first:rounded-tr-[4px] last:rounded-bl-[4px] last:rounded-br-[4px] last:pb-2 hover:text-white hover:bg-primaryRed ${showCategoryDetail === category.index ? "bg-primaryRed text-white" : "bg-white text-black"}`}
                >
                  <CategoryItem nameCategory={category.name} iconCategory={category.icon} />
                </div>
              ))}
            </div>
            {isHover && (
              <div className="col-span-10">
                <div className="bg-white rounded-[4px] h-[500px] shadow p-4">
                  <CategoryDetail showDetail={showCategoryDetail} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
