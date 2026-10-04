<script lang="ts" module>
  // Text/icon color only - the pill's background stays the same neutral
  // tone whether or not it's active, so the active side never looks
  // brighter than the inactive one (that mismatch was especially visible
  // in dark mode).
  export const voteColor = (vote: number) =>
    vote == 1
      ? `text-primary-600 dark:text-primary-400`
      : vote == -1
        ? `text-red-600 dark:text-red-400`
        : ''

  export const shouldShowVoteColor = (
    vote: number,
    type: 'upvotes' | 'downvotes',
  ): string =>
    (vote == -1 && type == 'downvotes') || (vote == 1 && type == 'upvotes')
      ? voteColor(vote)
      : ''
</script>

<script lang="ts">
  import { site } from '$lib/api/client.svelte'
  import type { Post } from '$lib/api/types'
  import { profile } from '$lib/app/auth'
  import { errorMessage } from '$lib/app/error'
  import { t } from '$lib/app/i18n'
  import { settings } from '$lib/app/settings.svelte'
  import FormattedNumber from '$lib/ui/util/FormattedNumber.svelte'
  import { toast } from 'mono-svelte'
  import { ChevronDown, ChevronUp, Icon } from 'svelte-hero-icons/dist'
  import { backOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import { vote as voteItem } from '../legacy/contentview'

  interface Props {
    post: Post
    vote?: number
    score: number
    upvotes: number
    downvotes: number
    showCounts?: boolean
    children?: import('svelte').Snippet<[{ vote?: number; score?: number }]>
  }

  let {
    post = $bindable(),
    vote = $bindable(),
    score = $bindable(),
    upvotes = $bindable(),
    downvotes = $bindable(),
    showCounts = true,
    children,
  }: Props = $props()

  const castVote = async (newVote: number) => {
    if (navigator.vibrate) navigator.vibrate(1)
    if (!profile.current?.jwt) {
      toast({ content: $t('toast.loginVoteGate'), type: 'warning' })
      return
    }

    switch (vote ?? 0) {
      case 0:
        // nothing was removed
        if (newVote == 1) upvotes++
        else downvotes++
        break
      case 1:
        // removed an upvote
        upvotes--
        if (newVote == -1) downvotes++
        break
      case -1:
        // removed a downvote
        downvotes--
        if (newVote == 1) upvotes++
        break
    }

    vote = newVote

    voteItem(post, newVote)
      .then((res) => ({ upvotes, downvotes, score } = res))
      .catch((e) => {
        toast({ content: errorMessage(e), type: 'error' })
      })
  }
</script>

{#snippet voteButton(
  votes: number,
  target: 'upvote' | 'downvote',
  vote?: number,
)}
  {@const targetNum = target == 'upvote' ? 1 : -1}
  <button
    onclick={() => castVote(vote == targetNum ? 0 : targetNum)}
    class={[
      'flex items-center gap-0.5 transition-colors relative cursor-pointer h-full p-2 first:border-r-0! first:rounded-l-[inherit] last:rounded-r-[inherit]',
      'last:flex-row-reverse',
      'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700',
      vote == targetNum &&
        shouldShowVoteColor(vote, target == 'upvote' ? 'upvotes' : 'downvotes'),
    ]}
    aria-pressed={vote == targetNum}
    aria-label={$t(
      target == 'upvote'
        ? 'post.actions.vote.upvote'
        : 'post.actions.vote.downvote',
    )}
  >
    <Icon src={target == 'upvote' ? ChevronUp : ChevronDown} size="20" micro />
    {#if showCounts}
      <div class="grid text-sm z-20">
        {#key votes}
          <span
            style="grid-column: 1; grid-row: 1;"
            in:fly={{ duration: 400, y: -10, easing: backOut }}
            out:fly={{ duration: 400, y: 10, easing: backOut }}
            aria-label={$t(
              target == 'upvote' ? 'aria.vote.upvotes' : 'aria.vote.downvotes',
              { default: votes },
            )}
          >
            <FormattedNumber number={votes ?? 0} />
          </span>
        {/key}
      </div>
    {/if}
  </button>
{/snippet}

{#if children}{@render children({ vote, score })}{:else}
  {@const voteRatio = Math.floor(
    ((upvotes ?? 0) / ((upvotes ?? 0) + (downvotes ?? 0))) * 100,
  )}
  <div
    class={[
      'rounded-full h-full font-medium flex relative overflow-hidden',
      voteRatio < 85 && settings.voteRatioBar && 'vote-ratio',
    ]}
    aria-label={$t('aria.vote.group')}
    style="--vote-ratio: {voteRatio}%;"
  >
    {@render voteButton(upvotes, 'upvote', vote)}
    {#if site.data?.site_view.local_site.enable_downvotes ?? true}
      {@render voteButton(downvotes, 'downvote', vote)}
    {/if}
  </div>
{/if}

<style>
  .vote-ratio {
    z-index: 0;
  }

  .vote-ratio::before {
    border-radius: inherit;
    content: '';
    position: absolute;
    height: 100%;
    opacity: 10%;
    width: 100%;
    left: 0;
    bottom: 0px;
    z-index: -10;
    background: linear-gradient(
      to right,
      var(--color-indigo-400) calc(var(--vote-ratio) - 2%),
      var(--color-red-400) calc(var(--vote-ratio) + 2%)
    );
  }
</style>
