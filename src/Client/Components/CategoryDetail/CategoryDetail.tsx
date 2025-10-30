import { useNavigate } from "react-router-dom"
import { MenuCategory } from "src/Types/product.type"

interface Props {
  showDetail: string
  listCategoryMenu: MenuCategory[]
}

export default function CategoryDetail({ listCategoryMenu }: Props) {
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
      {listCategoryMenu[0]?.sections.map((item, index) => (
        <div key={index} className="mr-20">
          <span className="text-base tracking-wide font-semibold text-primaryBlue">{item.name}</span>
          {item.items.map((valueItem, indexValue) => (
            <button
              onClick={() => handleNavigate(valueItem.slug, valueItem.type_filter as string)}
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
