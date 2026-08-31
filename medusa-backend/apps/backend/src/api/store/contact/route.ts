import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const body = req.body as any || {};
    const { firstName, lastName, email, phone, topic, orderId, message } = body;

    if (!firstName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Email, Tin nhắn)."
      });
    }

    const ticketCode = `TK-${Date.now().toString().slice(-6)}`;
    console.log(`[Contact API] Received new support request [${ticketCode}]:`, {
      name: `${firstName} ${lastName || ""}`.trim(),
      email,
      phone,
      topic,
      orderId,
      message,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      ticketCode,
      message: "Gửi tin nhắn liên hệ thành công! Đội ngũ tư vấn sẽ phản hồi bạn qua email trong thời gian sớm nhất."
    });
  } catch (error: any) {
    console.error("[Contact API] Error processing contact submission:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau."
    });
  }
}
