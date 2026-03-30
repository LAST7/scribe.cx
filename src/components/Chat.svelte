<script lang="ts">
    import { tick } from "svelte";

    import type { LLMResponseState, MessageFeed } from "@/types";

    import AssistantPlaceholder from "@/components/AssistantPlaceholder.svelte";
    import { logger } from "@/utils/logger";

    interface Props {
        messages: Array<MessageFeed>;
        llmResponse: LLMResponseState;
        modelName?: string;
        class?: string;
    }

    let {
        messages,
        llmResponse,
        modelName = "LLM",
        class: className = ""
    }: Props = $props();
    let viewport: HTMLElement | null = $state(null);

    // Automatically scroll to bottom when new message arrives
    // Q: Is it a good idea to put it here and detect changes of `messageFeed`?
    // Is there a better way? Like trigger scrolling via the send button click?
    $effect(() => {
        // Q: maybe check last message's id instead of the message itself?
        const lastMessage = messages[messages.length - 1];
        const lastMessageContent = lastMessage?.content;

        // No message
        if (!lastMessage) return;

        // Q: Is this necessary?
        if (!lastMessageContent && llmResponse.phase !== "pending") return;

        tick().then(() => {
            if (!viewport) {
                logger.error(
                    "Chat viewport binding failed. Autoscrolling aborted."
                );
                return;
            }

            // TODO: make it an item in preference
            const threshold = 200;
            const isAtBottom =
                viewport.scrollHeight -
                    viewport.clientHeight -
                    viewport.scrollTop <
                threshold;

            // Do not scroll down when user is navigating upper messages
            if (!isAtBottom && lastMessage.role !== "user") return;

            // UGLY: this is going to output hundreds of logs to the console
            // logger.debug(
            //     `MessageFeed change detected, scrolling. Behavior: ${isStreaming ? "instant" : "smooth"}`
            // );
            // QUESTION: `smooth` behavior does not seem to be problemsome?
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior:
                    llmResponse.phase === "streaming" ? "instant" : "smooth"
            });
        });
    });
</script>

{#snippet ChatBubble(bubble: MessageFeed)}
    <div
        class="flex w-full gap-3 {bubble.role === 'user'
            ? 'flex-row-reverse'
            : 'flex-row'}">
        <!-- avatar -->
        <div class="shrink-0">
            <div
                class="size-10 rounded-full bg-surface-500/20 flex items-center justify-center border border-surface-500/30">
                {bubble.role === "user" ? "U" : "AI"}
            </div>
        </div>

        <div
            class="flex flex-col max-w-[80%] {bubble.role === 'user'
                ? 'items-end'
                : 'items-start'}">
            <!-- timestamp & username -->
            <div
                class="flex items-center gap-2 mb-1 {bubble.role === 'user'
                    ? 'flex-row-reverse'
                    : 'flex-row'}">
                {#if bubble.role === "user"}
                    <!-- TODO: username -->
                    <span class="text-sm font-bold">Username</span>
                {:else}
                    <span class="text-sm font-bold">{modelName}</span>
                {/if}
                <span class="text-[10px] opacity-40">{bubble.timestamp}</span>
            </div>
            <!-- message -->
            <div
                class="card rounded-xl p-3 shadow-sm space-y-2
                {bubble.role === 'user'
                    ? 'preset-filled-primary-500 rounded-tr-none text-white'
                    : `preset-tonal rounded-tl-none`}">
                <!-- whitespace-pre-wrap for LLM multi-line responses -->
                <p
                    class="prose-invert text-sm leading-relaxed whitespace-pre-wrap">
                    {bubble.content}
                </p>
            </div>
        </div>
    </div>
{/snippet}

<!-- TODO: Render something when messageFeed is null or empty -->
<section bind:this={viewport} class="{className} px-2 space-y-4">
    {#each messages as bubble (bubble.id)}
        {#if llmResponse.phase === "pending" && bubble.id === llmResponse.messageId}
            <AssistantPlaceholder />
        {:else}
            {@render ChatBubble(bubble)}
        {/if}
    {/each}
</section>
