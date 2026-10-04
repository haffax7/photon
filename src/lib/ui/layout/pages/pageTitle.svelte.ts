import type { Snippet } from 'svelte'

// Lets <Header pageHeader> hand its title snippet up to the fixed Navbar, so
// the current page's title can render next to the logo instead of as a
// large heading pushed down the page.
export const pageTitleState: { title: Snippet | undefined } = $state({
  title: undefined,
})
