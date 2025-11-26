/* eslint-disable @typescript-eslint/no-explicit-any */
// ...existing code...
import { useRef } from "react"
import { Button } from "antd"
import { Printer } from "lucide-react"
// eslint-disable-next-line import/no-named-as-default
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { formatCurrency, convertDateTime } from "src/Helpers/common"
import { OrderItemType } from "src/Types/product.type"
import logo from "src/Assets/img/logo_cut.png"

export default function PrintBill({ order }: { order: OrderItemType }) {
  const printRef = useRef<HTMLDivElement | null>(null)
  const generatePdf = async () => {
    try {
      if (!printRef.current) return

      const wrapper = printRef.current.parentElement as HTMLElement | null
      const prev = wrapper
        ? {
            position: wrapper.style.position,
            left: wrapper.style.left,
            top: wrapper.style.top,
            visibility: wrapper.style.visibility,
            zIndex: wrapper.style.zIndex,
            display: wrapper.style.display
          }
        : null

      if (wrapper) {
        wrapper.style.position = "fixed"
        wrapper.style.left = "0"
        wrapper.style.top = "0"
        wrapper.style.visibility = "visible"
        wrapper.style.zIndex = "9999"
        wrapper.style.display = "block"
      }

      await new Promise((r) => setTimeout(r, 80))

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollY: -window.scrollY
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgProps = (pdf as any).getImageProperties(imgData)
      const imgWidth = pageWidth
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      if (wrapper && prev) {
        wrapper.style.position = prev.position
        wrapper.style.left = prev.left
        wrapper.style.top = prev.top
        wrapper.style.visibility = prev.visibility
        wrapper.style.zIndex = prev.zIndex
        wrapper.style.display = prev.display
      }

      pdf.save(`bill_${order._id}.pdf`)
    } catch (error) {
      console.error("Generate PDF failed", error)
      const wrapper = printRef.current?.parentElement as HTMLElement | null
      if (wrapper) {
        wrapper.style.position = ""
        wrapper.style.left = ""
        wrapper.style.top = ""
        wrapper.style.visibility = ""
        wrapper.style.zIndex = ""
        wrapper.style.display = "none"
      }
      window.print()
    }
  }

  // small helper to ensure safe values
  const safe = (v: any) => (v === undefined || v === null ? "" : v)

  return (
    <>
      <Button
        type="default"
        icon={<Printer size={16} />}
        onClick={generatePdf}
        className="bg-white/20 hover:bg-white/30 text-black mt-2"
      >
        In hoá đơn
      </Button>

      {/* hidden printable area */}
      <div style={{ position: "absolute", left: -9999, top: -9999, visibility: "hidden" }}>
        <div
          ref={printRef}
          style={{
            width: 820,
            padding: 24,
            background: "#fff",
            color: "#111",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 12,
            boxSizing: "border-box"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Inline SVG logo (replace with real logo img if available) */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: "#0ea5e9",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700
                }}
              >
                <img src={logo} alt="E-TechZone Logo" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>E-TechZone</div>
                <div style={{ color: "#555" }}>Địa chỉ: 123 HV, HCM</div>
                <div style={{ color: "#555" }}>Hotline: 0123-456-789</div>
                <div style={{ color: "#555" }}>Email: techzone@company.com</div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>HOÁ ĐƠN BÁN HÀNG</div>
              <div style={{ marginTop: 8 }}>
                <div>
                  Mã đơn: <strong>#{safe(order._id)}</strong>
                </div>
                <div>Ngày: {convertDateTime(order.created_at)}</div>
                <div>Phương thức thanh toán: {safe(order.type_order) || "Chưa xác định"}</div>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
              padding: "10px 0",
              display: "flex",
              gap: 12
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin khách hàng</div>
              <div>Tên: {safe(order.customer_info?.name)}</div>
              <div>SĐT: {safe(order.customer_info?.phone)}</div>
              <div>Địa chỉ: {safe(order.customer_info?.address)}</div>
            </div>
            <div style={{ width: 220 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Thông tin đơn hàng</div>
              <div>
                Trạng thái: <strong>{safe(order.status)}</strong>
              </div>
              <div>Số lượng SP: {order.products?.length ?? 0}</div>
              <div>Mã khuyến mãi: {order.voucher_code ?? "—"}</div>
            </div>
          </div>

          {/* Products table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #e5e7eb", width: 40 }}>#</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #e5e7eb" }}>Sản phẩm</th>
                <th style={{ textAlign: "center", padding: "8px", borderBottom: "2px solid #e5e7eb", width: 60 }}>
                  SL
                </th>
                <th style={{ textAlign: "right", padding: "8px", borderBottom: "2px solid #e5e7eb", width: 120 }}>
                  Đơn giá
                </th>
                <th style={{ textAlign: "right", padding: "8px", borderBottom: "2px solid #e5e7eb", width: 100 }}>
                  Giảm
                </th>
                <th style={{ textAlign: "right", padding: "8px", borderBottom: "2px solid #e5e7eb", width: 120 }}>
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {(order.products || []).map((p: any, idx: number) => {
                const discounted = p.discount ? p.price - p.price * (p.discount / 100) : p.price
                const line = (discounted || p.price) * (p.quantity || 1)
                return (
                  <tr key={p.product_id ?? idx}>
                    <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>{idx + 1}</td>
                    <td style={{ padding: "8px", borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.sku && <div style={{ color: "#6b7280", fontSize: 11 }}>SKU: {p.sku}</div>}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                      {p.quantity}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>
                      {formatCurrency(p.price)}đ
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>
                      {p.discount ? `${p.discount}%` : "—"}
                    </td>
                    <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #f3f4f6" }}>
                      {formatCurrency(line)}đ
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <div style={{ width: 320 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <div>Tạm tính</div>
                <div>{formatCurrency(order.subTotal || 0)}đ</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <div>Phí vận chuyển</div>
                <div>{formatCurrency(order.shipping_fee || 0)}đ</div>
              </div>
              {order.discount_amount ? (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#e11d48" }}>
                  <div>Giảm giá</div>
                  <div>-{formatCurrency(order.discount_amount)}đ</div>
                </div>
              ) : null}
              <div
                style={{
                  borderTop: "1px dashed #e5e7eb",
                  marginTop: 8,
                  paddingTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700
                }}
              >
                <div>Tổng cộng</div>
                <div style={{ fontSize: 16 }}>{formatCurrency(order.totalAmount || 0)}đ</div>
              </div>
            </div>
          </div>

          {/* footer / notes */}
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", gap: 16 }}>
            <div style={{ width: "60%" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Ghi chú</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>
                {order.note || "Cảm ơn quý khách. Vui lòng kiểm tra hàng trước khi thanh toán."}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#374151" }}>
                <strong>Giữ hoá đơn để được bảo hành:</strong>
                <div style={{ marginTop: 6 }}>
                  Hoá đơn này là chứng từ hợp lệ để yêu cầu bảo hành sản phẩm. Vui lòng lưu giữ hoá đơn và phiếu bảo
                  hành (nếu có).
                </div>
                <div style={{ marginTop: 6, color: "#6b7280" }}>
                  Điều kiện bảo hành: sản phẩm còn nguyên tem, không có dấu hiệu can thiệp kỹ thuật hoặc lỗi do sử dụng
                  sai hướng dẫn.
                </div>
              </div>
            </div>

            <div style={{ width: 200, textAlign: "center" }}>
              {/* signature boxes */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Người bán</div>
                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1", marginTop: 12 }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Người mua</div>
                <div style={{ height: 48, borderBottom: "1px dashed #cbd5e1", marginTop: 12 }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: "center", color: "#9ca3af", fontSize: 11 }}>
            Hoá đơn được tạo tự động — Vui lòng lưu giữ hoá đơn cho mục đích đổi trả / bảo hành.
          </div>
        </div>
      </div>
    </>
  )
}
