<script lang="ts">
    import { tick } from "svelte";

    import type { LLMResponseState, MessageFeed } from "@/types";

    import AssistantPlaceholder from "@/components/AssistantPlaceholder.svelte";
    import ChatBubble from "./ChatBubble.svelte";
    import Welcome from "./Welcome.svelte";

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

            // QUESTION: `smooth` behavior does not seem to be problemsome?
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior:
                    llmResponse.phase === "streaming" ? "instant" : "smooth"
            });
        });
    });

    function onRetry(bubble: MessageFeed) {
        logger.info("Trigger retry for: ", bubble.id);
    }
</script>

<!-- TODO: Render something when messageFeed is null or empty -->
<section bind:this={viewport} class="{className} px-2 space-y-4">
    {#if messages.length === 0}
        <Welcome />
    {/if}
    {#each messages as messageFeed (messageFeed.id)}
        {#if llmResponse.phase === "pending" && messageFeed.id === llmResponse.messageId}
            <AssistantPlaceholder />
        {:else}
            <ChatBubble {messageFeed} {modelName} {onRetry} />
        {/if}
    {/each}
</section>
