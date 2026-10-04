<script lang="ts">
  import { isYoutubeLink } from '$lib/feature/post/helpers'
  import PostIframe, {
    youtubeVideoID,
  } from '$lib/feature/post/media/PostIframe.svelte'
  import { photonify } from './plugins'

  interface Props {
    href?: string
    title?: string
    children?: import('svelte').Snippet
  }

  let { href = '', title = undefined, children }: Props = $props()

  export const parseURL = (href: string) => {
    try {
      return new URL(href)
    } catch {
      return undefined
    }
  }

  let photonified = $derived(photonify(href))
  let youtube = $derived(isYoutubeLink(href))
  let youtubeId = $derived(youtube ? youtubeVideoID(href) : null)
</script>

{#if youtube}
  <span class="block w-full max-w-lg not-prose my-2 aspect-video">
    <PostIframe
      type="youtube"
      url={href}
      {title}
      thumbnail={youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : undefined}
    />
  </span>
{:else}
  <a
    href={photonified ?? href}
    {title}
    class="hover:underline text-blue-600 dark:text-blue-400"
  >
    {@render children?.()}
  </a>
{/if}
