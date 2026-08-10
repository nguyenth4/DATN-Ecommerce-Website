import { useEffect, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label, Badge } from "@medusajs/ui"

interface SpecItem {
  key: string
  value: string
}

export const ProductSpecsWidget = ({ data }: { data?: any }) => {
  const productId = data?.id

  // Physical Attributes
  const [weight, setWeight] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [width, setWidth] = useState<string>("")
  const [length, setLength] = useState<string>("")

  // Metadata Fields
  const [brand, setBrand] = useState<string>("")
  const [subtitle, setSubtitle] = useState<string>("")
  const [videoUrl, setVideoUrl] = useState<string>("")

  // Tech Specs Key-Value pairs
  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Initialize fields when widget loads or data changes
  useEffect(() => {
    if (data) {
      setWeight(data.weight !== undefined && data.weight !== null ? String(data.weight) : "250")
      setHeight(data.height !== undefined && data.height !== null ? String(data.height) : "15")
      setWidth(data.width !== undefined && data.width !== null ? String(data.width) : "7.5")
      setLength(data.length !== undefined && data.length !== null ? String(data.length) : "0.8")

      const meta = data.metadata || {}
      setBrand(meta.brand || "")
      setSubtitle(meta.subtitle || "")
      setVideoUrl(meta.video_url || "")

      const existingSpecs = meta.specifications || {}
      const specArray: SpecItem[] = Object.entries(existingSpecs).map(([key, value]) => ({
        key,
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }))

      if (specArray.length > 0) {
        setSpecs(specArray)
      } else {
        // Default template for mobile/electronics if no specs exist yet
        setSpecs([
          { key: "Màn hình", value: "6.7 inch OLED 120Hz" },
          { key: "Chip CPU", value: "Apple A18 Pro 6 nhân" },
          { key: "RAM", value: "8 GB" },
          { key: "Bộ nhớ trong", value: "256 GB" },
          { key: "Dung lượng pin", value: "4422 mAh (Sạc nhanh 30W)" },
          { key: "Camera sau", value: "48MP + 48MP + 12MP" },
          { key: "Camera trước", value: "12MP TrueDepth" },
          { key: "Bảo hành", value: "12 tháng chính hãng" },
        ])
      }
    }
  }, [data])

  const handleAddSpec = () => {
    if (!newKey.trim()) return
    setSpecs([...specs, { key: newKey.trim(), value: newValue.trim() }])
    setNewKey("")
    setNewValue("")
  }

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  const handleSpecChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specs]
    updated[index][field] = val
    setSpecs(updated)
  }

  const handleSave = async () => {
    if (!productId) return
    setLoading(true)
    setMessage(null)

    // Convert specs array back to record object
    const specRecord: Record<string, string> = {}
    specs.forEach((item) => {
      if (item.key.trim()) {
        specRecord[item.key.trim()] = item.value.trim()
      }
    })

    const payload = {
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      width: parseFloat(width) || 0,
      length: parseFloat(length) || 0,
      metadata: {
        ...(data.metadata || {}),
        brand: brand.trim(),
        subtitle: subtitle.trim(),
        video_url: videoUrl.trim(),
        specifications: specRecord,
      },
    }

    try {
      const res = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setMessage({ type: "success", text: "Đã cập nhật thông số kỹ thuật & kích thước thành công!" })
      } else {
        const errData = await res.json().catch(() => ({}))
        setMessage({ type: "error", text: errData.message || "Cập nhật thất bại. Vui lòng thử lại." })
      }
    } catch (err) {
      console.error("Failed to update product specs:", err)
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ Admin." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <div>
          <Heading level="h2">⚙️ Quản lý Thông Số Kỹ Thuật & Thuộc Tính Sản Phẩm (T-85)</Heading>
          <p className="text-sm text-gray-500 mt-1">
            Chỉnh sửa cân nặng, kích thước, thương hiệu và bảng thông số kỹ thuật hiển thị ở Trang chi tiết sản phẩm Storefront.
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} isLoading={loading}>
          💾 Lưu Thông Số
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded mb-4 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* SECTION 1: PHYSICAL DIMENSIONS */}
      <div className="mb-6">
        <Heading level="h3" className="text-base font-semibold mb-3">
          📦 Trọng Lượng & Kích Thước Vật Lý (GHN / GHTK Sync)
        </Heading>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-gray-600 font-medium">Trọng lượng (gam)</Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="VD: 250"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Chiều cao (cm)</Label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="VD: 15"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Chiều rộng (cm)</Label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="VD: 7.5"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Chiều dài (cm)</Label>
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="VD: 0.8"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: METADATA EXTRA INFO */}
      <div className="mb-6 border-t pt-4">
        <Heading level="h3" className="text-base font-semibold mb-3">
          🏷️ Thông Tin Bổ Sung (Brand & Subtitle & Video)
        </Heading>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-600 font-medium">Thương hiệu (Brand)</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="VD: Apple, Samsung, Xiaomi..."
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Mô tả ngắn (Subtitle)</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="VD: Titan Sa Mạc 256GB - VN/A"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Link Video Review YouTube</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL SPECIFICATIONS (CRUD TABLE) */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Heading level="h3" className="text-base font-semibold">
            📋 Bảng Thông Số Kỹ Thuật (Technical Specifications)
          </Heading>
          <Badge color="blue">{specs.length} Thông số</Badge>
        </div>

        <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-1">
          {specs.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
              <div className="w-1/3">
                <Input
                  size="small"
                  value={item.key}
                  onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                  placeholder="Tên thông số (VD: Chip CPU)"
                />
              </div>
              <div className="flex-1">
                <Input
                  size="small"
                  value={item.value}
                  onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                  placeholder="Giá trị thông số (VD: Apple A18 Pro)"
                />
              </div>
              <Button
                size="small"
                variant="danger"
                onClick={() => handleRemoveSpec(idx)}
                title="Xóa thông số này"
              >
                🗑️
              </Button>
            </div>
          ))}
          {specs.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">
              Chưa có thông số kỹ thuật nào. Thêm mới ở ô bên dưới.
            </div>
          )}
        </div>

        {/* ADD NEW SPEC ROW */}
        <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded border border-blue-200">
          <div className="w-1/3">
            <Input
              size="small"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="+ Tên thông số mới (VD: Tần số quét)"
            />
          </div>
          <div className="flex-1">
            <Input
              size="small"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Giá trị (VD: 120Hz ProMotion)"
            />
          </div>
          <Button size="small" variant="secondary" onClick={handleAddSpec}>
            ➕ Thêm Mục
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductSpecsWidget
