// src/custom-admin/widgets/OrdersWidget.tsx
import React, { useEffect, useState } from "react"
import { Route, useNavigate } from "react-router-dom"
import { adminOrders } from "../../shared/lib/medusa"
import { Card, DataTable, StatusBadge, Badge, Text, Button, LoadingOverlay } from "@medusajs/ui"
import { PencilSquareIcon, CheckBadgeIcon } from "@heroicons/react/24/solid"

// Simple status mapping to Medusa UI colors
const statusColorMap: Record<string, string> = {
  draft: "gray",
  pending: "orange",
  completed: "green",
  canceled: "red",
  fulfilled: "green",
}

export const OrdersWidget = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const limit = 20

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { orders } = await adminOrders.list({ limit, offset: page * limit })
      setOrders(orders)
    } catch (e) {
      console.error("Failed to fetch orders", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [page])

  const handleFulfill = async (orderId: string, method: string) => {
    try {
      await adminOrders.updateStatus(orderId, "fulfilled", method)
      fetchOrders()
    } catch (e) {
      console.error("Fulfill error", e)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Text variant="heading2">Quản lý Đơn hàng</Text>
        {loading && <LoadingOverlay />}
      </div>
      <DataTable
        columns={[
          { header: "ID", accessor: "id" },
          { header: "Trạng thái", accessor: "status", cell: ({ value }: any) => (
            <StatusBadge color={statusColorMap[value] || "gray"}>{value}</StatusBadge>
          ) },
          { header: "Tổng tiền", accessor: "total", cell: ({ value }: any) => (
            <Text>{Number(value).toLocaleString()} ₫</Text>
          ) },
          { header: "Phương thức vận chuyển", accessor: "shipping_method" },
          { header: "Hành động", accessor: "actions", cell: ({ row }: any) => (
            <div className="flex gap-2">
              {row.original.status !== "fulfilled" && (
                <>
                  <Button variant="secondary" onClick={() => handleFulfill(row.original.id, "ghn")}>Duyệt (GHN)</Button>
                  <Button variant="secondary" onClick={() => handleFulfill(row.original.id, "ghtk")}>Duyệt (GHTK)</Button>
                </>
              )}
            </div>
          ) },
        ]}
        data={orders}
        pagination={{
          pageIndex: page,
          pageSize: limit,
          pageCount: Math.ceil(orders.length / limit),
          canPreviousPage: page > 0,
          canNextPage: orders.length === limit,
          previousPage: () => setPage(p => Math.max(p - 1, 0)),
          nextPage: () => setPage(p => p + 1),
        }}
      />
    </Card>
  )
}

// Export a route that Medusa Admin can mount inside its navigation
export const OrdersRoute = () => (
  <Route path="/orders" element={<OrdersWidget />} />
)
