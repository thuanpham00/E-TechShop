import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { MenuCategoryDetail } from "src/Client/Constants/categories"
import { AppContext } from "src/Context/authContext"

interface Props {
  showDetail: string
}

export default function CategoryDetail({ showDetail }: Props) {
  const { setIsShowCategory } = useContext(AppContext)
  const navigate = useNavigate()

  const handleNavigate = (valueItem: string) => {
    navigate(`/collections/${valueItem}`)
    setIsShowCategory(false)
  }

  return (
    <div className="flex items-start">
      {MenuCategoryDetail[Number(showDetail)].map((item, index) => (
        <div key={index} className="mr-20">
          <span className="text-[14px] font-semibold text-primaryRed">{item.heading}</span>
          {item.value.map((valueItem, indexValue) => (
            <button
              onClick={() => handleNavigate(valueItem.path)}
              key={indexValue}
              className="block my-3 text-[13px] font-medium cursor-pointer hover:text-primaryRed"
            >
              {valueItem.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
