import { useEffect, useState } from "react"
import { adminOrders } from "../../shared/lib/medusa"
import "./AdminOrdersPage.css"

interface OrderItem {
  id: string
  status: string
  total: number
  shipping_method?: string
  metadata?: Record<string, any>
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const limit = 20

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await adminOrders.list({ limit, offset: page * limit })
      setOrders(res.orders)
    } catch (e) {
      console.error("Failed to load orders", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [page])

  const handleStatusChange = async (orderId: string, newStatus: string, shippingMethod?: string) => {
    try {
      await adminOrders.updateStatus(orderId, newStatus, shippingMethod)
      // refresh list
      fetchOrders()
    } catch (e) {
      console.error("Update status error", e)
    }
  }

  return (
    <div className="admin-orders-page">
      <h1>Quản lý đơn hàng</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Phương thức giao hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="order-row">
                <td>{o.id}</td>
                <td>
                  <span className={`status-badge status-${o.status}`}>{o.status}</span>
                </td>
                <td>{o.total?.toLocaleString()} ₫</td>
                <td>{o.shipping_method || "-"}</td>
                <td>
                  {/* Simple status change buttons for demo */}
                  {o.status !== "fulfilled" && (
                    <button
                      className="action-btn"
                      onClick={() => handleStatusChange(o.id, "fulfilled", "ghn")}
                    >
                      Duyệt (GHN)
                    </button>
                  )}
                  {o.status !== "fulfilled" && (
                    <button
                      className="action-btn"
                      onClick={() => handleStatusChange(o.id, "fulfilled", "ghtk")}
                    >
                      Duyệt (GHTK)
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination-controls">
        <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
          ← Trang trước
        </button>
        <span>Trang {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={orders.length < limit}>
          Trang sau →
        </button>
      </div>
    </div>
  )
}
