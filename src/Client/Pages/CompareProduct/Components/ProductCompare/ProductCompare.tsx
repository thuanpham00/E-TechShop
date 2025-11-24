/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalculateSalePrice, formatCurrency } from "src/Helpers/common"

export default function ProductCompare({ productSelected }: { productSelected: any }) {
  return productSelected?.productSelected ? (
    <div>
      <div className="flex justify-center">
        <img
          src={productSelected.productSelected?.banner.url}
          alt={productSelected.productSelected?.name}
          className="w-[60%] h-[300px] object-cover"
        />
      </div>
      <h2 className="font-medium text-base my-2 h-[50px]">{productSelected.productSelected?.name}</h2>
      {productSelected.productSelected?.discount > 0 && (
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-red-500">
            {CalculateSalePrice(productSelected.productSelected?.price, productSelected.productSelected?.discount)}₫
          </h2>
          <span className="block text-[15px] text-[#6d6e72] font-semibold line-through">
            {formatCurrency(productSelected.productSelected?.price)}₫
          </span>
          <div className="py-[1px] px-1 rounded-sm border border-[#e30019] text-[#e30019] text-[11px]">
            -{productSelected.productSelected?.discount}%
          </div>
        </div>
      )}
      {productSelected.productSelected?.discount === 0 && (
        <h2 className="text-xl font-semibold text-red-500">
          {formatCurrency(productSelected.productSelected?.price)}₫
        </h2>
      )}
    </div>
  ) : (
    <p className="text-gray-500">Chưa chọn sản phẩm</p>
  )
}
