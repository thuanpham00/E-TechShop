import { useQuery } from "@tanstack/react-query"
import { Helmet } from "react-helmet-async"
import { useParams } from "react-router-dom"
import { adminAPI } from "src/Apis/admin.api"
import Skeleton from "src/Components/Skeleton"
import { BrandItemType } from "src/Types/product.type"
import { SuccessResponse } from "src/Types/utils.type"

export default function CategoryDetail() {
  const { id } = useParams()
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["categoryDetail", id],
    queryFn: () => {
      return adminAPI.getCategoryDetail(id as string)
    },
    enabled: Boolean(id)
    // chỉ chạy khi idCustomer có giá trị
  })

  const listBrandOfCategory = data?.data.result as SuccessResponse<BrandItemType[]>
  console.log(listBrandOfCategory)
  return (
    <div>
      <Helmet>
        <title>Chi tiết danh mục</title>
        <meta
          name="description"
          content="Đây là trang TECHZONE | Laptop, PC, Màn hình, điện thoại, linh kiện Chính Hãng"
        />
      </Helmet>
      {listBrandOfCategory ? (
        <div>
          {" "}
          {isLoading && <Skeleton />}
          {!isFetching ? (
            <div>
              <div>
                <div className="bg-[#f2f2f2] grid grid-cols-10 items-center gap-2 py-3 border border-[#dedede] px-4">
                  <div className="col-span-2 text-[14px] font-medium">ID</div>
                  <div className="col-span-2 text-[14px] font-medium">Tên thể loại</div>
                  <div className="col-span-2 text-[14px] font-medium">Ngày tạo</div>
                  <div className="col-span-2 text-[14px] font-medium">Ngày cập nhật</div>
                  <div className="col-span-2 text-[14px] text-center font-medium">Hành động</div>
                </div>
                <div className="">
                  {/* {listBrandOfCategory.map((item) => (
                    <Fragment key={item._id}>
                      <CategoryItem handleEditItem={handleEditItem} item={item} />
                    </Fragment>
                  ))} */}
                </div>
              </div>
              {/* <Pagination
                data={result}
                queryConfig={queryConfig}
                page_size={page_size}
                pathNavigate={path.AdminCategories}
              /> */}
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        <div className="text-center mt-4">Không tìm thấy kết quả</div>
      )}
    </div>
  )
}
