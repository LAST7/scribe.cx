<script lang="ts">
    import { Sparkles, FileText, List, MessageSquare } from "@lucide/svelte";

    interface Props {
        onSuggestionClick?: (prompt: string) => void;
    }

    let { onSuggestionClick }: Props = $props();

    const suggestions = [
        { icon: FileText, text: "Summarize Current Page" },
        { icon: List, text: "Extract core ideas" },
        { icon: MessageSquare, text: "Explain terminologies" }
    ];
</script>

<div
    class="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
    <!-- Icon & Greeting -->
    <div class="mb-6 flex flex-col items-center space-y-4">
        <div
            class="flex size-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
            <Sparkles class="size-8" />
        </div>
        <div class="space-y-1">
            <h2 class="h3 font-bold">Greetings from Scribe.cx</h2>
        </div>
    </div>

    <div class="w-full max-w-sm space-y-2">
        {#each suggestions as item}
            <button
                type="button"
                class="card card-hover rounded-xl flex w-full items-center gap-3 p-3 text-left preset-tonal"
                onclick={() => onSuggestionClick?.(item.text)}>
                <div
                    class="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-500/10">
                    <item.icon class="size-4 opacity-70" />
                </div>
                <span class="text-sm font-medium">{item.text}</span>
            </button>
        {/each}
    </div>
</div>
