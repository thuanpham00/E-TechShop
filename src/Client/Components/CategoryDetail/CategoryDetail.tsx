import { useNavigate } from "react-router-dom"
import { MenuCategoryDetail } from "src/Client/Constants/categories"

interface Props {
  showDetail: string
}

export default function CategoryDetail({ showDetail }: Props) {
  const navigate = useNavigate()

  const handleNavigate = (valueItem: string, type: string) => {
    navigate(`/collections/${valueItem}`, {
      state: {
        type_filter: type
      }
    })
  }

  return (
    <div className="flex items-start">
      {MenuCategoryDetail[Number(showDetail)]?.map((item, index) => (
        <div key={index} className="mr-20">
          <span className="text-base tracking-wide font-semibold text-primaryBlue">{item.heading}</span>
          {item.value.map((valueItem, indexValue) => (
            <button
              onClick={() => handleNavigate(valueItem.path, valueItem.type_filter as string)}
              key={indexValue}
              className="block my-3 text-[13px] font-medium cursor-pointer hover:text-primaryBlue"
            >
              {valueItem.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
