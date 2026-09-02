// ========================================
// 通知
// ========================================

export async function setupNotifications() {

    try {

        // ========================================
        // 対応確認
        // ========================================

        if (!("serviceWorker" in navigator)) {

            alert(
                "この端末はService Workerに対応していません"
            );

            return false;
        }


        if (!("Notification" in window)) {

            alert(
                "このブラウザは通知に対応していません"
            );

            return false;
        }


        // ========================================
        // Service Worker登録
        // ========================================

        const registration =
            await navigator.serviceWorker.register(
                "./sw.js"
            );


        await navigator.serviceWorker.ready;


        // ========================================
        // 通知許可
        // ========================================

        let permission =
            Notification.permission;


        if (permission === "default") {

            permission =
                await Notification.requestPermission();

        }


        if (permission !== "granted") {

            alert(
                "通知が許可されていません"
            );

            return false;
        }


        // ========================================
        // テスト通知
        // ========================================

        await registration.showNotification(
            "TIME",
            {
                body:
                    "通知の設定が完了しました！",

                icon:
                    "./icons/apple-touch-icon.png",

                badge:
                    "./icons/favicon-32.png"
            }
        );


        alert(
            "テスト通知を送信しました"
        );


        return true;


    } catch (error) {

        console.error(
            "通知設定エラー:",
            error
        );

        alert(
            `通知設定でエラーが発生しました\n${error.message}`
        );

        return false;

    }

}