import { Eye, Star } from "lucide-react"
import { useContext, useMemo, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { CalculateSalePrice, ConvertAverageRating, formatCurrency, slugify } from "src/Helpers/common"
import { CollectionItemType } from "src/Types/product.type"
import image_default from "src/Assets/img/anh_default_url.jpg"
import { useNavigate } from "react-router-dom"
import { AppContext } from "src/Context/authContext"

const getStatusTagClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "bg-gradient-to-r from-blue-400 to-blue-600"
    case "discontinued":
      return "bg-gradient-to-r from-orange-400 to-pink-500"
    case "out_of_stock":
      return "bg-gradient-to-r from-yellow-400 to-orange-400"
    default:
      return "bg-gray-300"
  }
}

export default function ProductItem({ item }: { item: CollectionItemType }) {
  const [imageChange, setImageChange] = useState<string | null>("")
  const navigate = useNavigate()
  const { setRecentlyViewed } = useContext(AppContext)

  const handleHoverProduct = (id: string) => {
    setImageChange(id)
  }

  const imageDefault = item.banner.url !== "" ? item.banner.url : image_default
  const randomImage = useMemo(() => {
    if (item.medias.length > 1) {
      return item.medias[Math.floor(Math.random() * item.medias.length)].url
    }
    return imageDefault
  }, [item.medias, imageDefault])

  const handleNavigate = () => {
    navigate(`/products/${slugify(item.name)}-i-${item._id}`, { state: item.category[0] })
    setRecentlyViewed((prev) => [...prev, item])
  }

  return (
    <button
      className="col-span-1 block border border-[#dedede] rounded-[4px] p-4 pt-[6px] bg-white transition-all duration-200 ease-in cursor-pointer"
      onMouseEnter={() => handleHoverProduct(item._id)}
      onMouseLeave={() => handleHoverProduct("")}
      onClick={handleNavigate}
    >
      <div className="flex flex-col relative">
        <div className="absolute top-[-2px] right-[-12px]">
          {item.status && (
            <span
              className={`${getStatusTagClass(item.status)} text-white px-3 pt-[4px] pb-[6px] rounded-[4px] text-xs font-medium w-fit mb-2`}
            >
              {item.status === "available"
                ? "Còn hàng"
                : item.status === "discontinued"
                  ? "Ngừng sản xuất"
                  : "Hết hàng"}
            </span>
          )}
        </div>
        <img
          loading="lazy"
          src={item._id === imageChange ? randomImage : imageDefault}
          alt={item.name}
          className="mt-4 object-cover w-full h-[180px] duration-200 transition-all"
        />
        <span className="text-[14px] font-bold mt-4 mb-2 block text-left line-clamp-2 h-[44px]">{item.name}</span>
        {item.discount ? (
          <Fragment>
            <span className="block text-[14px] text-left line-through text-[#6d7e72] font-semibold">
              {formatCurrency(item.price)}₫
            </span>
            <div className="flex items-center gap-2">
              <span className="block text-[16px] text-[#e30019] font-semibold">
                {CalculateSalePrice(item.price, item.discount)}₫
              </span>
              <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
                -{item.discount}%
              </div>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <span className="opacity-0 text-[14px] line-through text-[#6d7e72] font-semibold">1</span>
            <span
              className="block text-[16px] text-[#e30019] font-semibold text-lè
            "
            >
              {formatCurrency(item.price)}₫
            </span>
          </Fragment>
        )}
        <div className="flex justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-[2px]">
              <span className="text-[13px] font-semibold text-[#FF8A00]">
                {ConvertAverageRating(item.averageRating)}
              </span>
              <Star color="#FF8A00" size={13} />
            </div>
            <div className="text-[13px] text-[#6d7e72]">({item.reviews.length} đánh giá)</div>
          </div>
          <div className="flex items-center gap-1">
            <Eye color="#6d7e72" size={14} />
            <span className="text-[13px]">{item.viewCount}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
