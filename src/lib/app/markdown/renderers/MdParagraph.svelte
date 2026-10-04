<script>
  import { getContext } from 'svelte'

  let { children } = $props()

  const options = getContext('options')
</script>

<p class={[!options.noStyle && 'leading-[1.7] break-words max-w']}>
  {@render children?.()}
</p>

<style>
  .max-w {
    max-width: 70ch;

    /* The 70ch readability cap is meant for running text - a paragraph
       that's just a block embed (video, etc.) shouldn't be squeezed down
       to text-column width. MdLink's embed wrapper carries .not-prose. */
    &:has(> :global(.not-prose)) {
      max-width: 100%;
    }
  }
</style>
