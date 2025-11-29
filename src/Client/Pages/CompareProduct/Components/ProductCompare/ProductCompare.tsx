/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react/jsx-runtime"
import { CalculateSalePrice, formatCurrency } from "src/Helpers/common"

export default function ProductCompare({ productSelected }: { productSelected: any }) {
  return productSelected?.productSelected ? (
    <Fragment>
      <div className="flex justify-center items-center">
        <img
          src={productSelected.productSelected?.banner.url}
          alt={productSelected.productSelected?.name}
          className="object-contain max-w-[180px] h-[150px] md:h-[180px]"
        />
      </div>
      <h2 className="font-medium text-sm md:text-base my-2 h-[40px] md:h-[50px]">
        {productSelected.productSelected?.name}
      </h2>
      {productSelected.productSelected?.discount > 0 && (
        <div className="mt-12 md:mt-0 flex md:items-center flex-col items-start md:flex-row gap-1 md:gap-3">
          <h2 className="text-lg md:text-xl font-semibold text-red-500">
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
        <h2 className="mt-12 md:mt-0 text-xl font-semibold text-red-500">
          {formatCurrency(productSelected.productSelected?.price)}₫
        </h2>
      )}
    </Fragment>
  ) : (
    <p className="text-gray-500">Chưa chọn sản phẩm</p>
  )
}
