/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { Rate, Input, Upload, Button } from "antd"
import { useNavigate, useLocation } from "react-router-dom"
import { PlusOutlined } from "@ant-design/icons"
import { ProductInOrder, TypeOrderItem } from "../Order/Order"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderApi } from "src/Apis/client/order.api"
import { CreateReviewOderBodyReq } from "src/Types/product.type"
import { toast } from "react-toastify"
import { getAccessTokenFromLS } from "src/Helpers/auth"

type ReviewItem = {
  product_id: string
  rating: number
  title: string
  comment: string
  images: File[]
}

const listTitleReview = ["Cực kì hài lòng", "Hài lòng", "Bình thường", "Không hài lòng", "Rất tệ"]

export default function OrderReview() {
  const queryClient = useQueryClient()
  const token = getAccessTokenFromLS()
  const navigate = useNavigate()
  const location = useLocation()
  const order: TypeOrderItem = location.state?.order

  const [reviews, setReviews] = useState<ReviewItem[]>(
    order.products.map((p) => ({
      product_id: p.product_id,
      rating: 5,
      title: listTitleReview[0],
      comment: "",
      images: []
    }))
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    window.scroll(0, 0) // scroll mượt
  }, [])

  const handleChange = (idx: number, field: keyof ReviewItem, value: any) => {
    setReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  const handleImageChange = (idx: number, files: File[]) => {
    setReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, images: files } : r)))
  }

  const addReviewOrder = useMutation({
    mutationFn: (body: { orderId: string; body: CreateReviewOderBodyReq }) => {
      const formattedBody: CreateReviewOderBodyReq = {
        reviews: body.body.reviews.map((r) => ({
          product_id: r.product_id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          images: r.images // Giữ nguyên mảng File[]
        }))
      }
      return OrderApi.addReviewOrder(body.orderId, formattedBody)
    }
  })

  const handleSubmit = () => {
    setSubmitting(true)
    const data = reviews.map((r) => ({
      product_id: r.product_id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      images: r.images
    }))

    addReviewOrder.mutate(
      {
        orderId: order.key,
        body: { reviews: data }
      },
      {
        onSuccess: () => {
          toast.success("Cảm ơn bạn đã đánh giá sản phẩm!", { autoClose: 1500 })

          queryClient.invalidateQueries({ queryKey: ["listOrder", token] })
          setTimeout(() => {
            navigate("/orders")
          }, 2000)
          // dong bo data danh gia
        },
        onSettled: () => {
          setSubmitting(false)
        }
      }
    )
  }

  if (!order) return <div className="text-center py-20">Không tìm thấy đơn hàng!</div>

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-8 my-4">
      <h2 className="text-xl font-bold mb-4">Đánh giá đơn hàng #{order?.key.slice(-8)}</h2>
      {order.products.map((product: ProductInOrder, idx: number) => (
        <div key={product.product_id} className="border-b pb-6 mb-6 last:border-none last:mb-0">
          <div className="flex gap-4 items-center mb-2">
            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border" />
            <div>
              <div className="font-semibold">{product.name}</div>
              <div className="text-gray-500 text-sm">x{product.quantity}</div>
            </div>
          </div>
          <div className="mb-2">
            <span className="font-medium mr-2">Đánh giá:</span>
            <Rate value={reviews[idx].rating} onChange={(value) => handleChange(idx, "rating", value)} />
          </div>
          <div className="mb-2 flex items-center flex-wrap gap-2">
            {listTitleReview.map((title, index) => (
              <button
                key={index}
                className={`border border-gray-300 p-2 rounded-full text-xs ${reviews[idx].title === title ? "bg-blue-500 text-white" : ""}`}
                onClick={() => handleChange(idx, "title", title)}
              >
                {title}
              </button>
            ))}
          </div>
          <div className="mb-2">
            <Input.TextArea
              rows={3}
              placeholder="Nhận xét về sản phẩm..."
              value={reviews[idx].comment}
              onChange={(e) => handleChange(idx, "comment", e.target.value)}
            />
          </div>
          <div>
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              multiple
              onChange={({ fileList }) =>
                handleImageChange(idx, fileList.map((f) => f.originFileObj).filter(Boolean) as File[])
              }
              showUploadList={{ showPreviewIcon: false }}
            >
              {reviews[idx].images.length < 4 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                </div>
              )}
            </Upload>
          </div>
        </div>
      ))}
      <Button type="primary" block size="large" loading={submitting} onClick={handleSubmit}>
        Gửi đánh giá
      </Button>
    </div>
  )
}
