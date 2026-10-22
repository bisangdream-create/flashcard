export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "POST 요청만 허용됩니다." }, { status: 405 });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다. Netlify 환경 변수에 API 키를 추가해 주세요." }, { status: 500 });
  }
  try {
    const body = await req.json();
    if (!body?.data || !body?.mimeType?.startsWith("image/")) {
      return Response.json({ error: "이미지 데이터가 올바르지 않습니다." }, { status: 400 });
    }
    if (body.data.length > 16_000_000) {
      return Response.json({ error: "이미지가 너무 큽니다. 더 작은 이미지로 시도해 주세요." }, { status: 413 });
    }
    const prompt = `사진에서 보이는 중국 한자/일본 한자 또는 영어 어휘를 읽고 학습 카드를 만들어 주세요.
JSON 배열만 반환하세요. 각 객체는 term, type, reading, meaning, example 필드를 가집니다.
type은 한자면 "hanzi", 영어 단어면 "english".
영어 reading은 IPA 발음기호만, 한자는 reading을 빈 문자열로 하세요.
meaning은 한국어 뜻이며 한자는 훈음도 포함하세요. example은 짧은 한국어 설명 또는 사용 예시이며 없으면 빈 문자열입니다.
잘 보이지 않는 단어는 추측하지 말고 제외하세요. 최대 100개만 반환하세요.
예: [{"term":"apple","type":"english","reading":"/ˈæp.əl/","meaning":"사과","example":"I ate an apple."}]`;
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: body.mimeType, data: body.data } }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      })
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return Response.json({ error: data?.error?.message || `Gemini API 오류 (${upstream.status})` }, { status: 502 });
    }
    const output = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!output) return Response.json({ error: "AI가 결과를 반환하지 않았습니다. 다른 사진으로 다시 시도해 주세요." }, { status: 502 });
    let parsed;
    try { parsed = JSON.parse(output); } catch {
      const cleaned = output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      parsed = JSON.parse(cleaned);
    }
    if (!Array.isArray(parsed)) throw new Error("AI 응답이 카드 목록 형식이 아닙니다.");
    const cards = parsed.slice(0, 100).map(c => ({
      term: String(c.term || "").trim(),
      type: c.type === "hanzi" ? "hanzi" : c.type === "english" ? "english" : "other",
      reading: String(c.reading || "").trim(),
      meaning: String(c.meaning || "").trim(),
      example: String(c.example || "").trim()
    })).filter(c => c.term && c.meaning);
    return Response.json({ cards });
  } catch (err) {
    return Response.json({ error: err.message || "서버에서 요청을 처리하지 못했습니다." }, { status: 500 });
  }
};
