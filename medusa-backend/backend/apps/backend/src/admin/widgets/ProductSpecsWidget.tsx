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

  // Metrics & Ratings
  const [rating, setRating] = useState<string>("5.0")
  const [saleCount, setSaleCount] = useState<string>("0")
  const [viewCount, setViewCount] = useState<string>("0")
  const [reviewCount, setReviewCount] = useState<string>("0")

  // Tech Specs Key-Value pairs
  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  // Other Custom Metadata (like seller, etc.)
  const [otherMeta, setOtherMeta] = useState<SpecItem[]>([])
  const [newMetaKey, setNewMetaKey] = useState("")
  const [newMetaValue, setNewMetaValue] = useState("")

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

      setRating(meta.rating !== undefined && meta.rating !== null ? String(meta.rating) : "5.0")
      setSaleCount(meta.sale_count !== undefined && meta.sale_count !== null ? String(meta.sale_count) : "0")
      setViewCount(meta.view_count !== undefined && meta.view_count !== null ? String(meta.view_count) : "0")
      setReviewCount(meta.review_count !== undefined && meta.review_count !== null ? String(meta.review_count) : "0")

      // Extract specifications
      const existingSpecs = meta.specifications || {}
      const specArray: SpecItem[] = Object.entries(existingSpecs).map(([key, value]) => ({
        key,
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }))
      setSpecs(specArray)

      // Extract other custom metadata keys
      const managedKeys = ["brand", "subtitle", "video_url", "specifications", "rating", "sale_count", "view_count", "review_count"]
      const otherArray: SpecItem[] = Object.entries(meta)
        .filter(([key]) => !managedKeys.includes(key))
        .map(([key, value]) => ({
          key,
          value: typeof value === "object" ? JSON.stringify(value) : String(value),
        }))
      setOtherMeta(otherArray)
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

  const handleAddOtherMeta = () => {
    if (!newMetaKey.trim()) return
    setOtherMeta([...otherMeta, { key: newMetaKey.trim(), value: newMetaValue.trim() }])
    setNewMetaKey("")
    setNewMetaValue("")
  }

  const handleRemoveOtherMeta = (index: number) => {
    setOtherMeta(otherMeta.filter((_, i) => i !== index))
  }

  const handleOtherMetaChange = (index: number, field: "key" | "value", val: string) => {
    const updated = [...otherMeta]
    updated[index][field] = val
    setOtherMeta(updated)
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

    // Convert other custom metadata back
    const otherMetaRecord: Record<string, any> = {}
    otherMeta.forEach((item) => {
      if (item.key.trim()) {
        try {
          otherMetaRecord[item.key.trim()] = JSON.parse(item.value.trim())
        } catch {
          otherMetaRecord[item.key.trim()] = item.value.trim()
        }
      }
    })

    const payload = {
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      width: parseFloat(width) || 0,
      length: parseFloat(length) || 0,
      metadata: {
        ...(data.metadata || {}),
        ...otherMetaRecord,
        brand: brand.trim(),
        subtitle: subtitle.trim(),
        video_url: videoUrl.trim(),
        rating: parseFloat(rating) || 5.0,
        sale_count: parseInt(saleCount, 10) || 0,
        view_count: parseInt(viewCount, 10) || 0,
        review_count: parseInt(reviewCount, 10) || 0,
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
        setMessage({ type: "success", text: "Đã cập nhật toàn bộ thông số & siêu dữ liệu thành công!" })
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
    <Container className="p-6 my-6 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <div>
          <Heading level="h2">⚡ Bộ Chỉnh Sửa Thông Số & Siêu Dữ Liệu Sản Phẩm (Custom Admin Metadata Editor)</Heading>
          <p className="text-sm text-gray-500 mt-1">
            Chỉnh sửa trực tiếp Trọng lượng, Kích thước, Đánh giá, Lượt bán, Video và Bảng Thông số Kỹ thuật (thay vì chỉ xem JSON).
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} isLoading={loading}>
          💾 Lưu Thay Đổi
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
          📦 Trọng Lượng & Kích Thước Vật Lý
        </Heading>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-gray-600 font-medium">Trọng lượng (g)</Label>
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

      {/* SECTION 2: METADATA EXTRA INFO & METRICS */}
      <div className="mb-6 border-t pt-4">
        <Heading level="h3" className="text-base font-semibold mb-3">
          🏷️ Thông Tin & Chỉ Số Sản Phẩm (Metadata)
        </Heading>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs text-gray-600 font-medium">Thương hiệu (Brand)</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="VD: Apple, Samsung..."
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Mô tả ngắn (Subtitle)</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="VD: Titan Sa Mạc 256GB"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">Link Video Review YouTube</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/..."
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-gray-600 font-medium">⭐ Đánh giá (Rating)</Label>
            <Input
              type="number"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="4.9"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">🔥 Lượt bán (Sale Count)</Label>
            <Input
              type="number"
              value={saleCount}
              onChange={(e) => setSaleCount(e.target.value)}
              placeholder="220"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">👁️ Lượt xem (View Count)</Label>
            <Input
              type="number"
              value={viewCount}
              onChange={(e) => setViewCount(e.target.value)}
              placeholder="5200"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600 font-medium">💬 Số nhận xét (Review Count)</Label>
            <Input
              type="number"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
              placeholder="312"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: TECHNICAL SPECIFICATIONS (CRUD TABLE) */}
      <div className="border-t pt-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <Heading level="h3" className="text-base font-semibold">
            📋 Bảng Thông Số Kỹ Thuật (Specifications)
          </Heading>
          <Badge color="blue">{specs.length} Thông số</Badge>
        </div>

        <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-1">
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
            <div className="text-center py-4 text-gray-400 text-sm">
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

      {/* SECTION 4: OTHER CUSTOM METADATA */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <Heading level="h3" className="text-base font-semibold">
            ⚙️ Các Siêu Dữ Liệu Khác (Other Custom Metadata)
          </Heading>
          <Badge color="grey">{otherMeta.length} Mục</Badge>
        </div>

        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-1">
          {otherMeta.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200">
              <div className="w-1/3">
                <Input
                  size="small"
                  value={item.key}
                  onChange={(e) => handleOtherMetaChange(idx, "key", e.target.value)}
                  placeholder="Key (VD: seller)"
                />
              </div>
              <div className="flex-1">
                <Input
                  size="small"
                  value={item.value}
                  onChange={(e) => handleOtherMetaChange(idx, "value", e.target.value)}
                  placeholder="Value (Text hoặc JSON)"
                />
              </div>
              <Button
                size="small"
                variant="danger"
                onClick={() => handleRemoveOtherMeta(idx)}
                title="Xóa mục này"
              >
                🗑️
              </Button>
            </div>
          ))}
          {otherMeta.length === 0 && (
            <div className="text-center py-2 text-gray-400 text-sm">
              Chưa có siêu dữ liệu tùy chỉnh nào khác.
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded border border-gray-300">
          <div className="w-1/3">
            <Input
              size="small"
              value={newMetaKey}
              onChange={(e) => setNewMetaKey(e.target.value)}
              placeholder="+ Key metadata mới"
            />
          </div>
          <div className="flex-1">
            <Input
              size="small"
              value={newMetaValue}
              onChange={(e) => setNewMetaValue(e.target.value)}
              placeholder="Giá trị metadata"
            />
          </div>
          <Button size="small" variant="secondary" onClick={handleAddOtherMeta}>
            ➕ Thêm Metadata
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
