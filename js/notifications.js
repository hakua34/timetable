import {
    app
} from "./firebase.js";

import {
    getMessaging,
    getToken,
    isSupported,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";


// ========================================
// VAPID公開鍵
// ========================================

const VAPID_KEY =
    "BGJEjSSZlbCY91k20OXW2r0IX1hELpomdi-T6Bb-prqYw-ZLN3-OMJylfywnQb3tehh2cfb6w8ZelbH0UE9TMbM";


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


        const supported =
            await isSupported();

        if (!supported) {

            alert(
                "この端末ではFirebase通知を利用できません"
            );

            return false;
        }


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
        // Service Worker
        // ========================================

        const registration =
            await navigator.serviceWorker.register(
                "./sw.js"
            );


        await navigator.serviceWorker.ready;


        // ========================================
        // Firebase Messaging
        // ========================================

        const messaging =
            getMessaging(app);


        // ========================================
        // FCM登録トークン取得
        // ========================================

        const token =
            await getToken(
                messaging,
                {
                    vapidKey:
                        VAPID_KEY,

                    serviceWorkerRegistration:
                        registration
                }
            );


        if (!token) {

            alert(
                "FCM登録トークンを取得できませんでした"
            );

            return false;
        }


        localStorage.setItem(
            "fcmToken",
            token
        );


        console.log(
            "FCM Token:",
            token
        );


        // ========================================
        // アプリを開いている時の通知
        // ========================================

        onMessage(
            messaging,
            async payload => {

                console.log(
                    "FCM foreground:",
                    payload
                );


                const title =
                    payload.notification?.title ||
                    "TIME";

                const body =
                    payload.notification?.body ||
                    "";


                await registration.showNotification(
                    title,
                    {
                        body,

                        icon:
                            "./icons/apple-touch-icon.png",

                        badge:
                            "./icons/favicon-32.png"
                    }
                );

            }
        );


        // ========================================
        // テスト用
        // ========================================

        prompt(
            "FCM登録トークン\nFirebaseのテスト送信に貼り付けてください",
            token
        );


        return true;


    } catch (error) {

        console.error(
            "FCM設定エラー:",
            error
        );


        alert(
            `FCM設定でエラーが発生しました\n${error.message}`
        );


        return false;

    }

}