import { defineMiddlewares } from "@medusajs/framework/http"
import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

function validateProductImages(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const body = req.body as Record<string, any>
  const images = body?.images
  if (images && Array.isArray(images) && images.length > 8) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Một sản phẩm không được vượt quá 8 ảnh."
    })
  }
  next()
}

function validateUploadSize(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const contentLength = parseInt(req.headers["content-length"] || "0", 10)
  // Max payload size: 40MB (e.g. 8 files of 5MB each)
  const MAX_PAYLOAD_SIZE = 40 * 1024 * 1024 
  
  if (contentLength > MAX_PAYLOAD_SIZE) {
    return res.status(400).json({
      type: "invalid_data",
      message: "Tổng dung lượng upload vượt quá giới hạn (40MB). Vui lòng chọn các file nhỏ hơn."
    })
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/products",
      method: "POST",
      middlewares: [validateProductImages]
    },
    {
      matcher: "/admin/products/:id",
      method: "POST",
      middlewares: [validateProductImages]
    },
    {
      matcher: "/admin/uploads",
      method: "POST",
      middlewares: [validateUploadSize]
    },
    {
      matcher: "/store/payment/*",
      publishableApiKey: false,
    }
  ]
})
