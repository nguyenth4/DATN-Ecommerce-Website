import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const input = req.files as Express.Multer.File[]

  if (!input?.length) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Không có file nào được tải lên.")
  }

  // Tối đa 8 ảnh trong 1 lần upload
  if (input.length > 8) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Chỉ được phép upload tối đa 8 ảnh cùng lúc."
    )
  }

  // Giới hạn dung lượng: 5MB mỗi file (có thể tuỳ chỉnh)
  const MAX_FILE_SIZE = 5 * 1024 * 1024

  for (const file of input) {
    if (file.size > MAX_FILE_SIZE) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `File ${file.originalname} vượt quá dung lượng tối đa cho phép (5MB).`
      )
    }
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: input?.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content: f.buffer.toString("base64"),
        access: "public",
      })),
    },
  })

  res.status(200).json({ files: result })
}
