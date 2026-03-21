<script lang="ts">
    import type { MessageFeed } from "@/types";

    import { getCurrentTimestamp } from "@/utils";

    import Header from "@/components/Header.svelte";
    import Chat from "@/components/Chat.svelte";
    import Prompt from "@/components/Prompt.svelte";

    // Messages
    let messageFeed: Array<MessageFeed> = $state([]);
    let isStreaming: boolean = $state(false);

    // TODO: should monitor and respond to changes in `local:cur_conversation`
    // messageFeed is `null` at first initialization of mock data
    storage.getItem("local:cur_conversation").then((val: unknown) => {
        messageFeed = val as Array<MessageFeed>;
    });

    function addMessage(role: "user" | "assistant", message: string) {
        // UGLY: this is ugly
        if (role === "user" && message === "") return;

        const newMessage: MessageFeed = {
            id: messageFeed.length.toString(),
            role,
            // TODO: model name & proper timestamp
            name: "Jane",
            timestamp: `Today @ ${getCurrentTimestamp()}`,
            content: message
        };
        // Update the message feed
        messageFeed = [...messageFeed, newMessage];
    }

    /**
     * update the last message in `messageFeed` by adding `chunk` to its content
     */
    function streamMessage(chunk: string) {
        const lastMessage = messageFeed[messageFeed.length - 1];
        if (lastMessage.role !== "assistant") {
            logger.error("Streaming message into non-assistant message!");
            return;
        }

        // SHIT: this is ugly
        // Maybe a special type of message should be allowed inside `messageFeed`? -- Even uglier.
        if (lastMessage.content === "fetching response...")
            lastMessage.content = "";

        lastMessage.content += chunk;
    }
</script>

<div class="flex flex-col h-screen justify-between bg-surface-100-950">
    <Header />
    <Chat
        {messageFeed}
        {isStreaming}
        class="flex-1 overflow-y-auto overflow-x-hidden z-10 pb-40" />
    <Prompt
        {addMessage}
        {streamMessage}
        bind:isStreaming
        class="absolute z-10 bottom-0 w-full bg-transparent pointer-events-none" />
</div>
