<script lang="ts">
  import { t } from '$lib/app/i18n'
  import { onDestroy } from 'svelte'
  import { pageTitleState } from './pageTitle.svelte'

  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-2xl',
    xl: 'text-6xl',
  }

  interface Props {
    pageHeader?: boolean
    // Only for a plain short text title (e.g. "Frontpage") - hands the
    // title up to the navbar instead of rendering it large here. Pages
    // whose title is rich content (banners, avatars, etc. - e.g. the user
    // profile header) must NOT set this, since that content isn't safe to
    // shrink into the navbar's slot or hide from the page.
    titleInNavbar?: boolean
    style?: string
    class?: string
    size?: keyof typeof sizes
    children?: import('svelte').Snippet
    extended?: import('svelte').Snippet
  }

  let {
    pageHeader = false,
    titleInNavbar = false,
    style = '',
    class: clazz = '',
    size = 'lg',
    children,
    extended,
  }: Props = $props()

  // The navbar shows this page's title next to the logo instead, so hand
  // the title snippet up there rather than rendering a large heading here.
  $effect(() => {
    if (titleInNavbar && children) pageTitleState.title = children
  })

  onDestroy(() => {
    if (titleInNavbar && pageTitleState.title === children) {
      pageTitleState.title = undefined
    }
  })
</script>

<header
  class={[
    pageHeader &&
      `w-[calc(100%+1.5rem)] sm:w-[calc(100%+3rem)]
  bg-slate-50 dark:bg-zinc-950 -mx-3 sm:-mx-6 sm:px-6 sm:pb-6 px-4 pb-4 -mt-64 pt-64
   border-b border-slate-100 dark:border-zinc-900 font-display margin z-0 mb-3 sm:mb-6`,
  ]}
  {style}
  aria-label={$t('aria.element.pageHeader')}
>
  {#if children}
    <h1
      class={[
        titleInNavbar ? 'sr-only' : sizes[size],
        'flex gap-2 w-full tracking-tight font-medium',
        clazz,
      ]}
    >
      {@render children?.()}
    </h1>
  {/if}
  {#if extended}
    <div class="flex flex-col gap-3 mt-3">
      {@render extended?.()}
    </div>
  {/if}
</header>
