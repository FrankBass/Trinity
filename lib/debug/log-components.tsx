// lib/debug/log-components.ts
export function withDebug(Component: any, name?: string) {
  const displayName = name || Component.displayName || Component.name || "AnonymousComponent"

  return function DebugWrapper(props: any) {
    try {
      console.log(`[v0][DEBUG] Rendering component: ${displayName}`)
      return <Component {...props} />
    } catch (err) {
      console.error(`[v0][ERROR] Rendering failed in: ${displayName}`, err)
      throw err
    }
  }
}
