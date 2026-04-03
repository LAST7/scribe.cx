<script lang="ts">
    import { TriangleAlert, RotateCcw } from "@lucide/svelte";
    import type { MessageFeed } from "@/types";

    import { cn } from "@/utils/cn";

    interface Props {
        messageFeed: MessageFeed;
        onRetry: (bubble: MessageFeed) => void;
        modelName?: string;
    }

    let { messageFeed, modelName = "LLM", onRetry }: Props = $props();

    const isUser: boolean = $derived(messageFeed.role === "user");
    const isError: boolean = $derived(messageFeed.error === true);

    const senderName: string = $derived(isUser ? "Username" : modelName);
    const errorTitle: string = $derived(
        isUser ? "Failed to send message" : "Failed to retrieve model reponse"
    );
</script>

{#snippet error(content: string)}
    <div class="flex items-start gap-2">
        <TriangleAlert class="mt-0.5 size-4 shrink-0 text-red-400" />
        <div class="space-y-1">
            <div class="text-sm font-semibold text-red-300">
                {errorTitle}
            </div>
            <p
                class="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-red-50/90">
                {content}
            </p>
        </div>
    </div>
{/snippet}

{#snippet bubble(content: string)}
    <p
        class={cn(
            "text-sm leading-relaxed whitespace-pre-wrap wrap-break-word",
            isUser && "prose-invert"
        )}>
        {content}
    </p>
{/snippet}

<div class={cn("flex w-full gap-3", isUser && "flex-row-reverse")}>
    <!-- Avatar -->
    <div class="shrink-0">
        <div
            class="size-10 rounded-full bg-surface-500/20 flex items-center justify-center border border-surface-500/30">
            {isUser ? "U" : "AI"}
        </div>
    </div>

    <!-- Message Content Area -->
    <div
        class={cn(
            "flex flex-col max-w-[80%]",
            isUser && "items-end",
            !isUser && "items-start"
        )}>
        <!-- Meta -->
        <div
            class={cn(
                "flex items-center gap-2 mb-1",
                isUser && "flex-row-reverse"
            )}>
            <span class="text-sm font-bold">{senderName}</span>
            <span class="text-[10px] opacity-40">{messageFeed.timestamp}</span>
        </div>

        <!-- Bubble Card -->
        <div
            class={cn(
                "card rounded-xl p-3 shadow-sm space-y-2",
                isUser && "rounded-tr-none",
                !isUser && "rounded-tl-none",
                // error style
                isError &&
                    "border border-red-500/30 bg-red-500/10 text-red-100",
                // normal style
                isUser && !isError && "preset-filled-primary-500 text-white",
                !isUser && !isError && "preset-tonal"
            )}>
            {#if isError}
                {@render error(messageFeed.content)}
            {:else}
                {@render bubble(messageFeed.content)}
            {/if}
        </div>

        <!-- Actions Area -->
        <!-- <div class="mt-2 flex items-center gap-2"> -->
        <!--     <button -->
        <!--         type="button" -->
        <!--         class="btn btn-sm variant-soft-error flex items-center gap-1" -->
        <!--         onclick={() => onRetry(bubble)}> -->
        <!--         <RotateCcw class="size-3.5" /> -->
        <!--     </button> -->
        <!-- </div> -->
    </div>
</div>
