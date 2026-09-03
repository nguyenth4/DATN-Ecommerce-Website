async function checkTextSafety(comment) {
  const apiKey = "";
  if (!apiKey) return { error: "No API Key" };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{
        parts: [{
            text: `Bạn là một hệ thống kiểm duyệt bình luận (review) cho trang thương mại điện tử. 
Hãy phân tích nội dung bình luận sau:
"${comment}"

Kiểm tra yếu tố:
1. "safe": Bình luận có an toàn không (không chứa từ ngữ thô tục, chửi thề, xúc phạm, phân biệt chủng tộc, đả kích cá nhân, chính trị)?
2. "relevant": (Không bắt buộc với bình luận ngắn) Nội dung có phải là spam vô nghĩa (như asdfghjk) hay quảng cáo website khác không? Bình luận ngắn gọn khen/chê sản phẩm bình thường vẫn hợp lệ.

Trả về định dạng JSON chính xác như sau:
{
  "safe": true hoặc false,
  "relevant": true hoặc false,
  "reason": "Lý do ngắn gọn bằng tiếng Việt giải thích cho quyết định"
}`
        }]
    }],
    generationConfig: { responseMimeType: "application/json" },
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
        }
    ]
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return res.json();
}

checkTextSafety("ôi trời ơiiiii Làm ăn như cứt, tụi mày là lũ lừa đảo.").then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
