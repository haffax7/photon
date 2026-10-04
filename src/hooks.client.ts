export function handleError({ error }) {
  const message = error instanceof Error ? error.message : String(error)

  // A new deploy swaps out the old build's hashed chunk files immediately,
  // so a tab that's still running the previous build can fail to fetch a
  // route chunk it hasn't loaded yet ("Failed to fetch dynamically imported
  // module" / "Importing a module script failed"). A single reload always
  // fixes this since it picks up the new build, so do it automatically
  // instead of leaving the user stuck on an error. Rate-limited via
  // sessionStorage so a genuinely persistent failure doesn't reload forever.
  const isChunkLoadError =
    /fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i.test(
      message,
    )

  if (isChunkLoadError && typeof window !== 'undefined') {
    const key = 'photon:chunk-reload-at'
    const last = Number(sessionStorage.getItem(key) ?? '0')
    const now = Date.now()

    if (now - last > 10_000) {
      sessionStorage.setItem(key, String(now))
      window.location.reload()
    }
  }

  return {
    message,
  }
}
