const clearCacheReloadButton =
    document.getElementById(
        "clear-cache-reload"
    );

clearCacheReloadButton?.addEventListener(
    "click",
    async () => {

        // PWA用キャッシュがあれば削除
        if ("caches" in window) {

            const keys =
                await caches.keys();

            await Promise.all(
                keys.map(key =>
                    caches.delete(key)
                )
            );
        }


        // URLを変えてページ自体も再取得
        const url =
            new URL(location.href);

        url.searchParams.set(
            "_refresh",
            Date.now()
        );

        location.replace(
            url.toString()
        );

    }
);