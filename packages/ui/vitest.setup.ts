/* Environnement jsdom : API navigateur absentes, utilisées par motion et par le lecteur de guide. */

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

if (typeof window !== 'undefined') {
  if (typeof window.IntersectionObserver === 'undefined') {
    Object.defineProperty(window, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserverStub })
    Object.defineProperty(globalThis, 'IntersectionObserver', { writable: true, configurable: true, value: IntersectionObserverStub })
  }
  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    })
  }
  if (typeof window.scrollTo !== 'function') {
    Object.defineProperty(window, 'scrollTo', { writable: true, configurable: true, value: () => {} })
  }
}
