import { Eye, Star } from "lucide-react"
import { useMemo, useState } from "react"
import { Fragment } from "react/jsx-runtime"
import { CalculateSalePrice, ConvertAverageRating, formatCurrency } from "src/Helpers/common"
import { CollectionItemType } from "src/Types/product.type"
import image_default from "src/Assets/img/anh_default_url.jpg"
import { Link } from "react-router-dom"

export default function ProductItem({ item }: { item: CollectionItemType }) {
  const [imageChange, setImageChange] = useState<string | null>("")

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

  return (
    <Link
      to={{
        pathname: `/products/${item._id}`
      }}
      state={item.category[0]}
      className="col-span-1 block border border-[#dedede] rounded-[4px] p-4 pt-[6px] bg-white transition-all duration-200 ease-in cursor-pointer"
      onMouseEnter={() => handleHoverProduct(item._id)}
      onMouseLeave={() => handleHoverProduct("")}
    >
      <div className="flex flex-col">
        <img
          loading="lazy"
          src={item._id === imageChange ? randomImage : imageDefault}
          alt={item.name}
          className="object-cover w-full duration-200 transition-all"
        />
        <span className="text-[14px] font-bold my-4">{item.name}</span>
        {item.discount ? (
          <Fragment>
            <span className="block text-[14px] line-through text-[#6d7e72] font-semibold">
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
            <span className="block text-[16px] text-[#e30019] font-semibold">{formatCurrency(item.price)}₫</span>
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
    </Link>
  )
}
