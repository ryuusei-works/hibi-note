/** Own side effects so React Strict Mode, remounts and navigation cannot duplicate them. */
export function createDashboardLifecycle() {
  let disposed = false;
  const cleanups: (() => void)[] = [];
  const timers = new Set<number>();
  const intervals = new Set<number>();
  const requests = new AbortController();
  return {
    get disposed() {
      return disposed;
    },
    listen(
      target: EventTarget | null | undefined,
      event: string,
      callback: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (!target || disposed) return;
      target.addEventListener(event, callback, options);
      cleanups.push(() => target.removeEventListener(event, callback, options));
    },
    setTimeout(callback: () => void, delay = 0) {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!disposed) callback();
      }, delay);
      timers.add(id);
      return id;
    },
    clearTimeout(id?: number) {
      window.clearTimeout(id);
      if (id !== undefined) timers.delete(id);
    },
    setInterval(callback: () => void, delay = 0) {
      const id = window.setInterval(() => {
        if (!disposed) callback();
      }, delay);
      intervals.add(id);
      return id;
    },
    clearInterval(id?: number) {
      window.clearInterval(id);
      if (id !== undefined) intervals.delete(id);
    },
    fetch(input: RequestInfo | URL, init?: RequestInit) {
      const signal = init?.signal
        ? AbortSignal.any([requests.signal, init.signal])
        : requests.signal;
      return window.fetch(input, { ...init, signal });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cleanups.reverse().forEach((cleanup) => cleanup());
      timers.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
      requests.abort();
      document
        .querySelectorAll<HTMLDialogElement>("dialog[open]")
        .forEach((dialog) => dialog.close());
      document.body.classList.remove(
        "workspace-modal-open",
        "dialog-open",
        "workspace-menu-open",
      );
    },
  };
}
export type DashboardLifecycle = ReturnType<typeof createDashboardLifecycle>;
