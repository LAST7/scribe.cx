<script lang="ts">
    import { SendIcon } from "@lucide/svelte";

    interface Props {
        addMessage: (role: "user" | "assistant", message: string) => void;
        streamMessage: (chunk: string) => void;
        isStreaming: boolean;
        class?: string;
    }

    // TODO: focus textarea when mounted

    let textareaRef: HTMLTextAreaElement;

    let {
        addMessage,
        streamMessage,
        isStreaming = $bindable(),
        class: className = ""
    }: Props = $props();
    let currentMessage = $state("");

    function handleInput(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = `${target.scrollHeight}px`;
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.code === "Enter" && !e.shiftKey && !e.isComposing) {
            e.preventDefault();

            // empty message
            if (currentMessage.trim() === "") return;

            handleSubmit();
        }
    }

    async function handleSubmit() {
        const userMessage = currentMessage;
        // Clear prompt
        currentMessage = "";

        // Restore form height
        textareaRef.style.height = "auto";
        // reset height after message sent
        if (textareaRef) textareaRef.style.height = "auto";
        // TODO: update Prompt.svelte UI style to prevent user input during LLM request

        addMessage("user", userMessage);

        // placeholder
        addMessage("assistant", "fetching response...");

        // isStreaming = true;
        try {
            await callLLM(userMessage, streamMessage);
        } catch (err: unknown) {
            logger.error(err);
        } finally {
            isStreaming = false;
        }

        // TODO: Store setValue
    }
</script>

<!-- pr-6 for scrollbar on the right -->
<section class="{className} p-4 pr-6">
    <div
        class="max-w-4xl mx-auto relative flex flex-col bg-surface-100-900/90 backdrop-blur-md rounded-2xl border border-surface-500/50 shadow-2xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary-500 transition-all pointer-events-auto">
        <textarea
            bind:this={textareaRef}
            bind:value={currentMessage}
            name="prompt"
            oninput={handleInput}
            onkeydown={onKeydown}
            rows="1"
            placeholder="Write a message..."
            class="rounded-container w-full p-3 bg-transparent border-0 focus:ring-0 resize-none min-h-20 max-h-50 overflow-y-auto text-sm"
        ></textarea>

        <div class="flex max-h-10 items-center justify-between p-1 pt-0">
            <div class="flex gap-1">
                <!--  TODO: Options -->
                <!-- <button -->
                <!--     class="btn-icon btn-icon-sm preset-tonal hover:bg-surface-300-700" -->
                <!--     title="Upload"> -->
                <!--     <span class="text-xs">📎</span> -->
                <!-- </button> -->
                <!-- <button -->
                <!--     class="btn-icon btn-icon-sm preset-tonal hover:bg-surface-300-700" -->
                <!--     title="Model Settings"> -->
                <!--     <span class="text-xs">⚙️</span> -->
                <!-- </button> -->
            </div>

            <!-- Send Button -->
            <button
                class="btn m-1 transition-all {currentMessage.trim()
                    ? 'preset-filled-primary-500 scale-100'
                    : 'preset-tonal scale-95 opacity-50'}"
                disabled={!currentMessage.trim()}
                onclick={handleSubmit}>
                <SendIcon class="size-6" />
            </button>
            <!-- TODO: Stop Button -->
        </div>
    </div>
</section>
