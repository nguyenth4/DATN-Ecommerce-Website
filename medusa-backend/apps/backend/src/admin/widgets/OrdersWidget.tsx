import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, StatusBadge, Button } from "@medusajs/ui"

const statusColorMap: Record<string, "grey" | "orange" | "green" | "red" | "blue"> = {
  draft: "grey",
  pending: "orange",
  completed: "green",
  canceled: "red",
  fulfilled: "green",
}

export const OrdersWidget = () => {
  const formatTiktokOrderId = (displayId?: string | number | null, orderId?: string) => {
    if (displayId != null) {
      return `#57760810${displayId.toString().padStart(10, '0')}`;
    }
    return orderId || '';
  };
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page] = useState(0)
  const limit = 20

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Remove status=pending so we can see all recent orders, 
      // but we will filter out legacy ones in the UI.
      const response = await fetch(`/admin/orders?limit=50&offset=${page * 50}&order=-created_at`);
      if (response.ok) {
        const data = await response.json();
        // Lọc bỏ những đơn hàng cũ (không có shipping_method trong metadata)
        const validOrders = (data.orders || []).filter((o: any) => o.metadata?.shipping_method);
        setOrders(validOrders);
      }
    } catch (e) {
      console.error("Failed to fetch orders", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [page])

  const handleFulfill = async (orderId: string, method: string) => {
    setLoading(true)
    try {
      // 1. Call sync-shipping endpoint (GHN/GHTK)
      const syncRes = await fetch(`/admin/orders/${orderId}/sync-shipping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ provider: method })
      });

      if (!syncRes.ok) {
        let errMessage = "Unknown error";
        try {
          const errData = await syncRes.json();
          errMessage = errData.message || errData.error || JSON.stringify(errData);
        } catch {
          errMessage = await syncRes.text();
        }
        alert(`Lỗi đồng bộ ${method.toUpperCase()}: ${errMessage}`);
        setLoading(false);
        return;
      }

      // 2. Create fulfillment in Medusa
      const order = orders.find((o) => o.id === orderId);
      if (order && order.items) {
        // Get stock location
        let locationId = undefined;
        try {
          const locRes = await fetch("/admin/stock-locations");
          if (locRes.ok) {
            const locData = await locRes.json();
            if (locData.stock_locations && locData.stock_locations.length > 0) {
              locationId = locData.stock_locations[0].id;
            }
          }
        } catch (e) {
          console.error("Failed to fetch stock locations", e);
        }

        await fetch(`/admin/orders/${orderId}/fulfillments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items: order.items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
            })),
            location_id: locationId,
            metadata: {
              shipping_method: method
            }
          })
        });
      }

      fetchOrders()
    } catch (e) {
      console.error("Fulfill error", e)
    }
    setLoading(false)
  }

  const [filter, setFilter] = useState<"all" | "need_refund" | "return_request">("all")

  const displayedOrders = filter === "need_refund"
    ? orders.filter(o => o.status === "canceled" && o.payment_status === "captured")
    : filter === "return_request"
      ? orders.filter(o => o.metadata?.return_requested)
      : orders;

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level="h2">Quản lý Đơn hàng (GHN / GHTK)</Heading>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            size="small"
            variant={filter === "all" ? "primary" : "secondary"}
            onClick={() => setFilter("all")}
          >
            Tất cả đơn
          </Button>
          <Button
            size="small"
            variant={filter === "need_refund" ? "primary" : "secondary"}
            onClick={() => setFilter("need_refund")}
          >
            Cần hoàn tiền
          </Button>
          <Button
            size="small"
            variant={filter === "return_request" ? "primary" : "secondary"}
            onClick={() => setFilter("return_request")}
          >
            Yêu cầu trả hàng
          </Button>
        </div>
      </div>
      {loading && <div style={{ padding: "20px", textAlign: "center" }}>Đang tải...</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eaeaea", textAlign: "left" }}>
            <th style={{ padding: "8px" }}>Mã Đơn Hàng</th>
            <th style={{ padding: "8px" }}>Trạng thái</th>
            <th style={{ padding: "8px" }}>Tổng tiền</th>
            <th style={{ padding: "8px" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {displayedOrders.map((order) => (
            <tr key={order.id} style={{ borderBottom: "1px solid #eaeaea" }}>
              <td style={{ padding: "8px" }}>
                <strong>{formatTiktokOrderId(order.display_id, order.id)}</strong>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                  ID Hệ thống: {order.id}
                </div>
              </td>
              <td style={{ padding: "8px" }}>
                <StatusBadge color={statusColorMap[order.status] || "grey"}>
                  {order.status}
                </StatusBadge>
              </td>
              <td style={{ padding: "8px" }}>
                {Number(order.total || 0).toLocaleString()} ₫
                {order.metadata?.return_requested && (
                  <div style={{ color: '#d97706', fontSize: '0.8rem', marginTop: '4px' }}>
                    Yêu cầu trả hàng: <strong>{order.metadata?.return_reason}</strong>
                    {order.metadata?.refund_destination && (
                      <div style={{ marginTop: '2px', color: order.metadata.refund_destination === 'wallet' ? '#7c3aed' : '#059669' }}>
                        Hoàn tiền về: <strong>{order.metadata.refund_destination === 'wallet' ? '💰 Ví Sprylo' : '🏦 Ngân hàng'}</strong>
                      </div>
                    )}
                    {order.metadata?.refund_info && (
                      <div style={{ marginTop: '2px', color: '#059669' }}>
                        Thông tin nhận tiền: <strong>{order.metadata.refund_info}</strong>
                      </div>
                    )}
                  </div>
                )}
              </td>
              <td style={{ padding: "8px", display: "flex", gap: "8px" }}>
                {order.status !== "fulfilled" && (
                  <>
                    <Button size="small" variant="secondary" onClick={() => handleFulfill(order.id, "ghn")}>
                      Duyệt (GHN)
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => handleFulfill(order.id, "ghtk")}>
                      Duyệt (GHTK)
                    </Button>
                  </>
                )}
                {(order.payment_status === "captured" || order.metadata?.return_requested) && (
                  <Button size="small" variant="danger" onClick={async () => {
                    if (!confirm("Bạn có chắc chắn muốn hoàn tiền cho đơn hàng này?")) return;
                    try {
                      // Note: We need to know the payment method, but for now we try zalopay or vnpay based on metadata
                      const method = order.metadata?.payment_method || 'zalopay';
                      const res = await fetch(`/admin/orders/${order.id}/refund`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ payment_method: method, amount: order.total || 0 })
                      });
                      if (res.ok) {
                        alert("Hoàn tiền thành công!");
                        fetchOrders();
                      } else {
                        const err = await res.json();
                        alert("Lỗi hoàn tiền: " + (err.message || "Unknown error"));
                      }
                    } catch (e: any) {
                      alert("Lỗi kết nối: " + e.message);
                    }
                  }}>
                    Hoàn tiền
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {displayedOrders.length === 0 && !loading && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "gray" }}>
                Không có đơn hàng nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.after",
})

export default OrdersWidget
