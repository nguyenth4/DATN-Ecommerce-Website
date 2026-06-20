import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { file } = req.params;

  // Resolve path to the static folder in project root
  const filePath = path.join(process.cwd(), "static", file);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // Determine content type based on extension
  const ext = path.extname(file).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") {
    contentType = "image/jpeg";
  } else if (ext === ".png") {
    contentType = "image/png";
  } else if (ext === ".webp") {
    contentType = "image/webp";
  } else if (ext === ".gif") {
    contentType = "image/gif";
  } else if (ext === ".svg") {
    contentType = "image/svg+xml";
  }

  res.setHeader("Content-Type", contentType);

  // Stream the file back
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
};
