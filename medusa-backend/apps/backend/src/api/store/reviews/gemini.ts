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

export async function checkTextSafety(
  comment: string,
  productName: string
): Promise<{ safe: boolean; reason: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Loại bỏ dấu tiếng Việt và ký tự đặc biệt để bắt trọn từ cố tình viết lách
  const removeAccents = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  const normalizedComment = removeAccents(comment);
  const lowerComment = comment.toLowerCase();

  // Danh sách từ cấm thô tục tiếng Việt (bao gồm cả có dấu & không dấu & biến thể)
  const PROFANITY_LIST = [
    "quan que", "quan que di", "quần quề", "quần quề dị", "quề dị",
    "lon", "lồn", "lồnn", "lồn", "dai", "dái", "buoi", "buồi", "đái", "ia", "ỉa", 
    "du", "đụ", "dm", "đm", "dmm", "đmm", "vai lon", "vãi lồn", "vãi lon", "vãi l", "chich", "chịch", 
    "cho de", "chó đẻ", "me kiep", "mẹ kiếp", "con me", "con mẹ", "cac", "cạc", "cc", "cl", "vl", "vkl",
    "dme", "đmê", "dit", "địt", "địt mẹ", "dit me"
  ];

  for (const profanity of PROFANITY_LIST) {
    const normalizedProfanity = removeAccents(profanity);
    if (lowerComment.includes(profanity) || normalizedComment.includes(normalizedProfanity)) {
      return {
        safe: false,
        reason: `Bình luận chứa từ ngữ thô tục / xúc phạm ("${profanity}"). Vui lòng sử dụng ngôn từ văn minh.`
      };
    }
  }

  if (!apiKey) {
    return { safe: true, reason: "Bypass do thiếu API key" };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Bạn là một hệ thống kiểm duyệt bình luận tự động cho website thương mại điện tử. 
Hãy kiểm tra xem bình luận sau đây đối với sản phẩm "${productName}" có an toàn không:
Bình luận: "${comment}"

Tiêu chí đánh giá:
- "safe": false nếu bình luận chứa từ ngữ thô tục, chửi thề, lăng mạ, xúc phạm danh dự, từ lóng tục tĩu (ví dụ: quần quề, lồn, dái, buồi, đụ, dm, v.v.), ngôn từ thù hận, bạo lực hoặc khiêu dâm.
- "safe": true nếu bình luận lịch sự, nêu nhận xét thật (dù là khen hay chê sản phẩm).

Trả về định dạng JSON chính xác như sau:
{
  "safe": true hoặc false,
  "reason": "Lý do ngắn gọn bằng tiếng Việt"
}`
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return { safe: true, reason: "Bypass" };

    const data = await response.json() as any;
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textResult) {
      const cleanText = textResult.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(cleanText);
    }
    return { safe: true, reason: "OK" };
  } catch (err) {
    console.error("Gemini text safety check error:", err);
    return { safe: true, reason: "Lỗi kết nối API" };
  }
}
