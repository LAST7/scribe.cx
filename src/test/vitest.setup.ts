import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "@/mock/node";

const { storageMemory } = vi.hoisted(() => ({
    storageMemory: new Map<string, unknown>()
}));

vi.mock("wxt/utils/storage", () => {
    const resolveValue = <T>(key: string, fallback: T): T => {
        return (
            storageMemory.has(key) ? storageMemory.get(key) : fallback
        ) as T;
    };

    return {
        storage: {
            defineItem: (
                key: string,
                options: { fallback?: unknown } = {}
            ) => ({
                getValue: async () =>
                    resolveValue(key, options.fallback ?? null),
                setValue: async (value: unknown) => {
                    storageMemory.set(key, value);
                }
            }),
            getItem: async (key: string) =>
                storageMemory.has(key) ? storageMemory.get(key) : null,
            setItem: async (key: string, value: unknown) => {
                storageMemory.set(key, value);
            },
            removeItem: async (key: string) => {
                storageMemory.delete(key);
            }
        }
    };
});

vi.mock("@/utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

// Minimal Svelte rune shim for store modules in Node tests.
(globalThis as any).$state = (value: unknown) => value;

// msw setup
beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    storageMemory.clear();
    vi.restoreAllMocks();
});
afterAll(() => server.close());
