/**
 * preloadAssets
 *
 * Preloads a list of image and video URLs, reporting progress as each one
 * finishes. Returns a cleanup function that aborts any pending fetches.
 *
 * Usage:
 *   const cancel = preloadAssets(urls, (ratio) => setProgress(ratio), onDone);
 *   // later: cancel();
 *
 * @param urls        Array of asset URLs (images and/or videos)
 * @param onProgress  Called with a 0–1 ratio each time an asset resolves
 * @param onComplete  Called once when ALL assets are resolved (or timed out)
 * @param maxWaitMs   Safety timeout in ms (default 8000). Remaining unloaded
 *                    assets are treated as done so the site never hangs.
 */
export function preloadAssets(
    urls: string[],
    onProgress: (ratio: number) => void,
    onComplete: () => void,
    maxWaitMs = 8000,
): () => void {
    if (urls.length === 0) {
        onProgress(1);
        onComplete();
        return () => { };
    }

    let resolved = 0;
    let finished = false;
    const controllers: AbortController[] = [];

    const resolve = () => {
        if (finished) return;
        resolved++;
        const ratio = resolved / urls.length;
        onProgress(ratio);
        if (resolved >= urls.length) {
            finished = true;
            onComplete();
        }
    };

    const isVideo = (url: string) =>
        /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

    urls.forEach((url) => {
        if (isVideo(url)) {
            // Fetch the video body so the browser caches it fully before playback
            const ctrl = new AbortController();
            controllers.push(ctrl);
            fetch(url, { signal: ctrl.signal })
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.blob(); // drain the entire response body
                })
                .then(() => resolve())
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        console.warn(`[preloadAssets] video failed: ${url}`, err);
                    }
                    resolve(); // still count it as done so we don't block forever
                });
        } else {
            // Standard image element approach — browser handles caching
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.warn(`[preloadAssets] image failed: ${url}`);
                resolve();
            };
            img.src = url;
        }
    });

    // Safety timeout: forcefully complete if assets take too long
    const timer = setTimeout(() => {
        if (finished) return;
        console.warn(
            `[preloadAssets] timeout after ${maxWaitMs}ms — ${urls.length - resolved} asset(s) still pending`,
        );
        finished = true;
        onProgress(1);
        onComplete();
    }, maxWaitMs);

    // Cleanup: abort in-flight video fetches and clear the timeout
    return () => {
        finished = true;
        clearTimeout(timer);
        controllers.forEach((c) => c.abort());
    };
}
