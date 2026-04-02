import { http, HttpResponse } from "msw";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function makeSseResponse(chunks: Array<string>) {
    return (
        chunks
            .map((content) => {
                return `data: ${JSON.stringify({
                    id: "chatcmpl-mock",
                    object: "chat.completion.chunk",
                    created: 1234567890,
                    model: "gpt-4o-mini",
                    choices: [
                        {
                            index: 0,
                            delta: { content },
                            finish_reason: null
                        }
                    ]
                })}\n\n`;
            })
            .join("") + "data: [DONE]\n\n"
    );
}

export const handlers = [
    http.get(OPENAI_URL + "/auth", ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer")) {
            return HttpResponse.json(
                {
                    error: {
                        message: "Missing bearer authentication in header",
                        type: "invalid_request_error",
                        param: null,
                        code: null
                    }
                },
                { status: 401 }
            );
        }

        return HttpResponse.json({ ok: true });
    }),
    http.post(OPENAI_URL, async ({ request }) => {
        const body = (await request.json()) as {
            messages?: Array<{ role: string; content: string }>;
            model?: string;
        };
        const lastMessage = body.messages?.at(-1)?.content ?? "";
        const reply = lastMessage.toLowerCase().includes("summarize")
            ? "Mock summary: concise result from the page."
            : "mock response";

        const chunks = reply.match(/\S+\s*/g) ?? [reply];

        return HttpResponse.text(makeSseResponse(chunks), {
            status: 200,
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive"
            }
        });
    })
];
