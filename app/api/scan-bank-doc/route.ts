import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ScanResult = {
  ifsc: string | null;
  accountNumber: string | null;
  bankName: string | null;
};

const SYSTEM_PROMPT = [
  "You extract Indian bank-account details from a photo of a passbook or cancelled cheque.",
  "Return strictly a JSON object with these keys:",
  "- ifsc: string or null (exactly 11 chars: 4 uppercase letters + '0' + 6 alphanumeric)",
  "- accountNumber: string or null (digits only, 9-18 digits)",
  "- bankName: string or null",
  "If a field is unreadable or you are not confident, set it to null. Never invent or guess.",
].join("\n");

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OCR not configured (OPENAI_API_KEY missing)" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing 'file' field" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return Response.json({ error: "Image too large (max 4 MB after compression)" }, { status: 413 });
  }

  const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const dataUrl = `data:${file.type};base64,${b64}`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract the bank details from this image and respond as JSON." },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
    }),
  });

  if (!openaiRes.ok) {
    return Response.json({ error: `OCR upstream error (${openaiRes.status})` }, { status: 502 });
  }

  const payload = (await openaiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return Response.json({ error: "Empty OCR response" }, { status: 502 });
  }

  let parsed: { ifsc?: unknown; accountNumber?: unknown; bankName?: unknown };
  try {
    parsed = JSON.parse(content);
  } catch {
    return Response.json({ error: "Could not parse OCR response" }, { status: 502 });
  }

  const ifscRaw =
    typeof parsed.ifsc === "string" ? parsed.ifsc.toUpperCase().replace(/\s+/g, "") : "";
  const ifsc = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscRaw) ? ifscRaw : null;

  const acctRaw =
    typeof parsed.accountNumber === "string" ? parsed.accountNumber.replace(/\D/g, "") : "";
  const accountNumber = /^\d{9,18}$/.test(acctRaw) ? acctRaw : null;

  const bankName =
    typeof parsed.bankName === "string" && parsed.bankName.trim().length > 0
      ? parsed.bankName.trim()
      : null;

  const result: ScanResult = { ifsc, accountNumber, bankName };
  return Response.json(result);
}
