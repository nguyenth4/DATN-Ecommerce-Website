import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, StatusBadge, Copy } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/types"
import { useQueryClient } from "@tanstack/react-query"

const CustomOrderWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

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
    if (newStatus === "canceled") {
      const confirmed = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")
      if (!confirmed) return
    }

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
        const errJson = await res.json().catch(() => null)
        throw new Error(errJson?.message || await res.text() || "Lỗi cập nhật trạng thái")
      }

      // Refresh the page reactively using TanStack Query
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["order", order.id] })
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Lỗi cập nhật trạng thái")
    } finally {
      setLoading(false)
    }
  }

  const meta = (order.metadata || {}) as any
  const dateStr = meta.confirmed_at ? new Date(meta.confirmed_at as string).toLocaleString("vi-VN") : ""

  const steps = [
    { key: "pending", label: "Chờ xác nhận" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "preparing", label: "Đang chuẩn bị" },
    { key: "shipping", label: "Đang vận chuyển" },
    { key: "delivered", label: "Đã giao" },
    { key: "completed", label: "Hoàn thành" },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === customStatus)

  return (
    <Container className="p-6 mb-4">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div>
          <Heading level="h2" className="text-xl font-bold flex items-center gap-2">
            Quy trình đơn hàng
          </Heading>
          <div className="flex items-center gap-2 mt-1">
            <Text className="text-xs text-gray-500 font-mono">
              Mã đơn hàng: <span className="text-gray-900 font-semibold select-all">{order.id}</span>
            </Text>
            <Copy content={order.id} className="text-xs font-mono" />
          </div>
        </div>
        <StatusBadge color={colorMap[customStatus] || "grey"}>
          {labelMap[customStatus] || customStatus}
        </StatusBadge>
      </div>

      {/* Timeline steps visualization */}
      {customStatus !== "canceled" ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <Text className="text-xs font-semibold text-gray-500 uppercase mb-3">Tiến trình xử lý đơn hàng</Text>
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex
              const isCurrent = step.key === customStatus
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <Text className={`text-xs text-center font-medium ${isCurrent ? "text-blue-600 font-bold" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                    {step.label}
                  </Text>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <Text className="text-sm font-semibold text-red-600">
            ⚠️ Đơn hàng đã bị hủy. Mọi thao tác chuyển trạng thái bị khóa.
          </Text>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Heading level="h3" className="text-sm font-semibold mb-2">Nhật ký & Thông tin</Heading>
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

          {meta.delivered_at && (
            <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
              <Text className="text-sm font-medium text-green-800">Giao hàng thành công</Text>
              <Text className="text-xs text-gray-600 mt-1">
                Thời gian: {new Date(meta.delivered_at).toLocaleString("vi-VN")}
              </Text>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end gap-2 items-start md:items-end">
          <Heading level="h3" className="text-sm font-semibold mb-2 md:self-end">Chuyển trạng thái tiếp theo</Heading>
          
          <div className="flex flex-wrap gap-2 justify-end w-full">
            {customStatus === "pending" && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "1. Xác nhận đơn hàng"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange("canceled")}
                  disabled={loading}
                >
                  Hủy đơn
                </Button>
              </>
            )}

            {customStatus === "confirmed" && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => handleStatusChange("preparing")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "2. Chuẩn bị hàng"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("shipping", "ghn")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Giao (GHN)"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("shipping", "ghtk")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Giao (GHTK)"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange("canceled")}
                  disabled={loading}
                >
                  Hủy đơn
                </Button>
              </>
            )}

            {customStatus === "preparing" && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("shipping", "ghn")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "3. Giao hàng (GHN)"}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("shipping", "ghtk")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "3. Giao hàng (GHTK)"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange("canceled")}
                  disabled={loading}
                >
                  Hủy đơn
                </Button>
              </>
            )}

            {customStatus === "shipping" && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("delivered")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "4. Xác nhận đã giao hàng"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange("canceled")}
                  disabled={loading}
                >
                  Giao thất bại / Hủy
                </Button>
              </>
            )}

            {customStatus === "delivered" && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleStatusChange("completed")}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "5. Hoàn thành đơn hàng"}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleStatusChange("canceled")}
                  disabled={loading}
                >
                  Yêu cầu trả hàng / Hủy
                </Button>
              </>
            )}

            {(customStatus === "completed" || customStatus === "canceled") && (
              <Text className="text-sm text-gray-500 italic">
                Đơn hàng ở trạng thái kết thúc ({labelMap[customStatus] || customStatus}). Không thể chuyển tiếp.
              </Text>
            )}
          </div>

          {error && (
            <Text className="text-red-500 text-xs mt-2 font-semibold bg-red-50 p-2 rounded border border-red-200 w-full text-right">{error}</Text>
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
