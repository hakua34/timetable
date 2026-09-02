// ========================================
// 通知
// ========================================

export async function setupNotifications() {

    if (!("serviceWorker" in navigator)) {
        alert("この端末は通知機能に対応していません");
        return false;
    }

    if (!("Notification" in window)) {
        alert("このブラウザは通知に対応していません");
        return false;
    }


    // Service Worker登録
    const registration =
        await navigator.serviceWorker.register(
            "./sw.js"
        );


    // 通知許可
    let permission =
        Notification.permission;

    if (permission !== "granted") {

        permission =
            await Notification.requestPermission();

    }


    if (permission !== "granted") {

        alert("通知が許可されませんでした");

        return false;
    }


    // テスト通知
    await registration.showNotification(
        "TIME",
        {
            body: "通知の設定が完了しました！",
            icon: "./icons/apple-touch-icon.png",
            badge: "./icons/favicon-32.png"
        }
    );


    return true;
}