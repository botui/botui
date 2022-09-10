export function resolveManager() {
  let resolver = (...args: any[]) => {}

  return {
    set: (callback: any): void => {
      resolver = callback
    },
    resolve: (...args: any[]) => resolver(...args),
  }
}