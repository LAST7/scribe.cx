import { http, HttpResponse } from "msw";

export const handlers = [
    http.get("https://blog.imlast.top", () => {
        return HttpResponse.json({
            id: "last",
            content: "carnival"
        });
    })
];
