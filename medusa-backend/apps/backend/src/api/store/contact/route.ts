import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const TICKETS_FILE = path.join(process.cwd(), "support_tickets.json");

const getSavedTickets = () => {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const data = fs.readFileSync(TICKETS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[Contact API] Error reading support_tickets.json:", err);
  }
  return [];
};

const saveTicket = (newTicket: any) => {
  try {
    const tickets = getSavedTickets();
    tickets.unshift(newTicket);
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), "utf-8");
  } catch (err) {
    console.error("[Contact API] Error writing to support_tickets.json:", err);
  }
};

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const tickets = getSavedTickets();
  return res.status(200).json({
    success: true,
    tickets
  });
}

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
    const fullName = `${firstName} ${lastName || ""}`.trim();
    const createdAt = new Date().toLocaleString("vi-VN");

    const newTicket = {
      ticketCode,
      fullName,
      email,
      phone,
      topic,
      orderId,
      message,
      createdAt,
      status: "pending"
    };

    // Save to local file so admin can review even without email key
    saveTicket(newTicket);

    console.log(`[Contact API] Received new support request [${ticketCode}]:`, newTicket);

    // Send email using SendGrid if API key is provided
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey && apiKey.startsWith("SG.")) {
      try {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(apiKey);
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || "nguyenhoang280004@gmail.com";
        const adminEmail = "sprylo123@gmail.com";

        // 1. Send notification to Admin (sprylo123@gmail.com)
        await sgMail.send({
          from: fromEmail,
          to: adminEmail,
          subject: `📩 [Sprylo Contact #${ticketCode}] ${topic} - ${fullName}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #4f46e5;">📩 Yêu cầu hỗ trợ mới từ khách hàng</h2>
              <p><strong>Mã phiếu:</strong> #${ticketCode}</p>
              <p><strong>Họ và tên:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Số điện thoại:</strong> ${phone || "Chưa cung cấp"}</p>
              <p><strong>Chủ đề:</strong> ${topic}</p>
              <p><strong>Mã đơn hàng:</strong> ${orderId || "Không có"}</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p><strong>Nội dung tin nhắn:</strong></p>
              <blockquote style="background: #f8fafc; padding: 12px 16px; border-left: 4px solid #4f46e5; margin: 0;">
                ${message.replace(/\n/g, '<br/>')}
              </blockquote>
            </div>
          `
        });

        // 2. Send confirmation to Customer
        await sgMail.send({
          from: fromEmail,
          to: email,
          subject: `✅ [Sprylo] Xác nhận đã nhận yêu cầu hỗ trợ #${ticketCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #4f46e5;">Cảm ơn bạn đã liên hệ với Sprylo!</h2>
              <p>Xin chào <strong>${fullName}</strong>,</p>
              <p>Chúng tôi đã nhận được yêu cầu hỗ trợ của bạn với mã phiếu <strong style="color: #4f46e5;">#${ticketCode}</strong>.</p>
              <p>Đội ngũ tư vấn Sprylo sẽ xử lý và phản hồi bạn qua email này trong vòng 2 - 4 giờ làm việc.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
              <p style="font-size: 13px; color: #64748b;">Nội dung bạn đã gửi: "${message}"</p>
            </div>
          `
        });
        console.log(`[Contact API] Emails sent successfully via SendGrid for ticket [${ticketCode}]`);
      } catch (emailErr: any) {
        console.error("[Contact API] Error sending email via SendGrid:", emailErr.response?.body || emailErr);
      }
    } else {
      console.warn(`[Contact API] SENDGRID_API_KEY chưa được cấu hình hợp lệ trong .env. Vui lòng cập nhật API Key để nhận email thực tế.`);
    }

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
