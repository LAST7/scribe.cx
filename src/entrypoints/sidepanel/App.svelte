<script lang="ts">
    import { browser } from "@wxt-dev/webextension-polyfill/browser";
    import { onMount } from "svelte";

    import { CHAT_PORT_NAME } from "@/types/portmessage";

    import Header from "@/components/Header.svelte";
    import Chat from "@/components/Chat.svelte";
    import Prompt from "@/components/Prompt.svelte";

    import { getConvState } from "@/stores/conversation.svelte";
    import { setFGChatPortListener } from "@/services/chatClient";

    const chat = getConvState();

    let chatPort: browser.Runtime.Port | null = $state(null);

    onMount(() => {
        chatPort = browser.runtime.connect({ name: CHAT_PORT_NAME });
        if (!chatPort) {
            // TODO: handle error
            logger.debug("Failed to connect chat port to background.");
            return;
        }

        chatPort.onDisconnect.addListener(() => {
            logger.error("ChatPort disconnected.");
        });
        setFGChatPortListener(chatPort);

        return () => {
            chatPort?.disconnect();
        };
    });
</script>

<div class="flex flex-col h-screen justify-between bg-surface-100-950">
    <Header />
    <Chat
        messages={chat.conversation.messages}
        llmResponse={chat.llmResponse}
        class="flex-1 overflow-y-auto overflow-x-hidden z-10 pb-40" />
    <Prompt
        {chatPort}
        llmResponse={chat.llmResponse}
        class="absolute z-10 bottom-0 w-full bg-transparent pointer-events-none" />
</div>
