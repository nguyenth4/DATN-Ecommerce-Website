import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, StatusBadge } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/types"

const CustomOrderWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const order = data
  if (!order) return null

  const customStatus = (order.metadata?.custom_status || order.status || "pending") as string
  
  const labelMap: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    preparing: "Đang chuẩn bị",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao",
    completed: "Hoàn thành",
    canceled: "Đã hủy",
  }

  const colorMap: Record<string, "orange" | "blue" | "green" | "red" | "grey"> = {
    pending: "orange",
    confirmed: "blue",
    preparing: "orange",
    shipping: "blue",
    delivered: "green",
    completed: "green",
    canceled: "red",
  }

  const handleStatusChange = async (newStatus: string, shippingMethod?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus, shipping_method: shippingMethod })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      // Refresh the page to load updated details
      window.location.reload()
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Lỗi cập nhật trạng thái")
    } finally {
      setLoading(false)
    }
  }

  const meta = (order.metadata || {}) as any
  const dateStr = meta.confirmed_at ? new Date(meta.confirmed_at as string).toLocaleString("vi-VN") : ""

  return (
    <Container className="p-6 mb-4">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div>
          <Heading level="h2" className="text-xl font-bold flex items-center gap-2">
            Quy trình đơn hàng (Custom)
          </Heading>
          <Text className="text-xs text-gray-500 mt-1">
            Đồng bộ hóa trạng thái Storefront & Giao hàng (GHN / GHTK)
          </Text>
        </div>
        <StatusBadge color={colorMap[customStatus] || "grey"}>
          {labelMap[customStatus] || customStatus}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Heading level="h3" className="text-sm font-semibold mb-2">Nhật ký xác nhận</Heading>
          {!meta.confirmed_by && !meta.confirmed_at ? (
            <Text className="text-sm text-gray-500 italic">Chưa được xác nhận bởi admin</Text>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <Text className="text-sm font-medium">Người xác nhận: <span className="font-semibold text-gray-800">{meta.confirmed_by || "Admin"}</span></Text>
              <Text className="text-xs text-gray-500 mt-1">Thời gian: {dateStr}</Text>
            </div>
          )}

          {meta.tracking_number && (
            <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Text className="text-sm font-medium">Đơn vị vận chuyển: <span className="font-semibold capitalize">{meta.shipping_provider || "GHN"}</span></Text>
              <Text className="text-sm font-medium mt-1">Mã vận đơn: <span className="font-mono font-semibold text-blue-600">{meta.tracking_number}</span></Text>
              {meta.shipping_fee && <Text className="text-xs text-gray-500 mt-1">Phí giao hàng đối tác: {Number(meta.shipping_fee).toLocaleString()} ₫</Text>}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-2 items-start md:items-end">
          <Heading level="h3" className="text-sm font-semibold mb-2 md:self-end">Hành động duyệt đơn</Heading>
          
          {customStatus === "pending" && (
            <Button
              variant="primary"
              onClick={() => handleStatusChange("confirmed")}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đơn hàng"}
            </Button>
          )}

          {customStatus === "confirmed" && (
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="secondary"
                onClick={() => handleStatusChange("shipping", "ghn")}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Duyệt đơn (Giao Hàng Nhanh)"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleStatusChange("shipping", "ghtk")}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Duyệt đơn (Giao Hàng Tiết Kiệm)"}
              </Button>
            </div>
          )}

          {customStatus !== "pending" && customStatus !== "confirmed" && (
            <Text className="text-sm text-gray-500 italic">Đơn hàng đã được duyệt và đang trong tiến trình giao hàng.</Text>
          )}

          {error && (
            <Text className="text-red-500 text-xs mt-1 font-semibold">{error}</Text>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default CustomOrderWidget
