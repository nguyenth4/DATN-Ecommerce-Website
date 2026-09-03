interface GeminiResult {
  safe: boolean;
  relevant: boolean;
  reason: string;
}

export async function checkImageSafety(
  base64Image: string,
  mimeType: string,
  productName: string
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in .env. Bypassing safety check.");
    return { safe: true, relevant: true, reason: "Bypass do thiếu API key" };
  }

  // Remove data:image/...;base64, prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Bạn là một hệ thống kiểm duyệt hình ảnh bình luận cho trang thương mại điện tử. 
Hãy phân tích hình ảnh đính kèm đối với sản phẩm có tên là: "${productName}".

Kiểm tra 2 yếu tố:
1. "safe": Hình ảnh có an toàn không (không chứa nội dung người lớn, bạo lực, phản cảm, vũ khí, chất kích thích)?
2. "relevant": Hình ảnh có liên quan đến sản phẩm hoặc trải nghiệm mua sắm, nhận hàng, mở hộp (unboxing) của sản phẩm này không? Không chấp nhận ảnh meme ngẫu nhiên, ảnh chụp màn hình code/lỗi phần mềm không liên quan, hoặc ảnh trống trơn/đen xì.

Trả về định dạng JSON chính xác như sau:
{
  "safe": true hoặc false,
  "relevant": true hoặc false,
  "reason": "Lý do ngắn gọn bằng tiếng Việt giải thích cho quyết định"
}`
          },
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json() as any;
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (textResult) {
      const cleanText = textResult.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(cleanText) as GeminiResult;
    }
    
    throw new Error("Không nhận được phản hồi phân tích từ Gemini.");
  } catch (error: any) {
    console.error("Lỗi khi kiểm duyệt ảnh với Gemini:", error);
    // Fallback to true if API fails so it doesn't block users if there's an API outage,
    // or we can reject. Let's allow but log to be safe.
    return { safe: true, relevant: true, reason: "Lỗi kết nối API Gemini: " + error.message };
  }
}
