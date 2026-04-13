<script lang="ts">
    import { onMount } from "svelte";
    import { storage } from "wxt/utils/storage";

    import type { LLMConfig } from "@/types";

    import Header from "@/components/Header.svelte";
    import Chat from "@/components/Chat.svelte";
    import Prompt from "@/components/Prompt.svelte";

    import { getConvState, submitPrompt } from "@/stores/conversation.svelte";

    const chat = getConvState();

    // LLM config
    let llmConfig: LLMConfig | null = $state(null);

    onMount(async () => {
        // TODO: move this to background.ts
        // TODO: should validate data read from storage
        // use valibot
        llmConfig = (await storage.getItem("local:llm_config")) as LLMConfig;
    });

    async function onPromptSubmit(userMessage: string) {
        if (!llmConfig) {
            logger.error("llmConfig is null or incomplete.", llmConfig);
            return;
        }

        await submitPrompt(userMessage, llmConfig);
    }
</script>

<div class="flex flex-col h-screen justify-between bg-surface-100-950">
    <Header />
    <Chat
        messages={chat.conversation.messages}
        llmResponse={chat.llmResponse}
        modelName={llmConfig?.modelName}
        class="flex-1 overflow-y-auto overflow-x-hidden z-10 pb-40" />
    <Prompt
        {onPromptSubmit}
        llmResponse={chat.llmResponse}
        class="absolute z-10 bottom-0 w-full bg-transparent pointer-events-none" />
</div>
