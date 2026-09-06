import {
    app
} from "./firebase.js?v=20260907-1";


import {
    getMessaging,
    getToken,
    isSupported,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js";


import {
    getFunctions,
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-functions.js";


// ========================================
// Firebase Functions
// ========================================

const functions =
    getFunctions(
        app,
        "asia-southeast1"
    );


const registerPushDevice =
    httpsCallable(
        functions,
        "registerPushDevice"
    );


// ========================================
// VAPID
// ========================================

const VAPID_KEY =
    "BGJEjSSZlbCY91k20OXW2r0IX1hELpomdi-T6Bb-prqYw-ZLN3-OMJylfywnQb3tehh2cfb6w8ZelbH0UE9TMbM";


let foregroundListenerStarted =
    false;


// ========================================
// 端末ID
// ========================================

function getDeviceId() {

    let deviceId =
        localStorage.getItem(
            "pushDeviceId"
        );


    if (deviceId) {
        return deviceId;
    }


    if (crypto.randomUUID) {

        deviceId =
            crypto.randomUUID();

    } else {

        deviceId =
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

    }


    localStorage.setItem(
        "pushDeviceId",
        deviceId
    );


    return deviceId;

}


// ========================================
// 設定取得
// ========================================

function getSavedSettings() {

    return {

        morningEnabled:
            localStorage.getItem(
                "morningNotificationEnabled"
            ) !== "false",

        morningTime:
            localStorage.getItem(
                "morningNotificationTime"
            ) || "07:00",

        changeEnabled:
            localStorage.getItem(
                "changeNotificationEnabled"
            ) !== "false"

    };

}


// ========================================
// 設定保存
// ========================================

function saveSettingsLocally(settings) {

    localStorage.setItem(
        "morningNotificationEnabled",
        String(
            settings.morningEnabled
        )
    );


    localStorage.setItem(
        "morningNotificationTime",
        settings.morningTime
    );


    localStorage.setItem(
        "changeNotificationEnabled",
        String(
            settings.changeEnabled
        )
    );

}


// ========================================
// フォームから設定取得
// ========================================

function getSettingsFromForm() {

    const morningEnabled =
        document.getElementById(
            "morning-notification-enabled"
        );


    const morningTime =
        document.getElementById(
            "morning-notification-time"
        );


    const changeEnabled =
        document.getElementById(
            "change-notification-enabled"
        );


    return {

        morningEnabled:
            morningEnabled?.checked ?? true,

        morningTime:
            morningTime?.value || "07:00",

        changeEnabled:
            changeEnabled?.checked ?? true

    };

}


// ========================================
// 設定を画面へ反映
// ========================================

function applySettingsToForm(settings) {

    const morningEnabled =
        document.getElementById(
            "morning-notification-enabled"
        );


    const morningTime =
        document.getElementById(
            "morning-notification-time"
        );


    const changeEnabled =
        document.getElementById(
            "change-notification-enabled"
        );


    if (morningEnabled) {

        morningEnabled.checked =
            settings.morningEnabled;

    }


    if (morningTime) {

        morningTime.value =
            settings.morningTime;

        morningTime.disabled =
            !settings.morningEnabled;

    }


    if (changeEnabled) {

        changeEnabled.checked =
            settings.changeEnabled;

    }

}


// ========================================
// ステータス
// ========================================

function setStatus(text) {

    const status =
        document.getElementById(
            "notification-status"
        );


    if (status) {

        status.textContent =
            text;

    }

}


// ========================================
// 設定画面表示
// ========================================

function showNotificationSettings() {

    const settings =
        document.getElementById(
            "notification-settings"
        );


    const button =
        document.getElementById(
            "notification-button"
        );


    if (settings) {

        settings.hidden =
            false;

    }


    if (button) {

        button.textContent =
            "通知は有効です";

        button.disabled =
            true;

    }

}


// ========================================
// Service Worker
// ========================================

async function getServiceWorker() {

    const registration =
        await navigator.serviceWorker.register(
            "./sw.js"
        );


    await navigator.serviceWorker.ready;


    return registration;

}


// ========================================
// FCM Token取得
// ========================================

async function getFcmToken() {

    const registration =
        await getServiceWorker();


    const messaging =
        getMessaging(app);


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

        throw new Error(
            "FCMトークンを取得できませんでした"
        );

    }


    localStorage.setItem(
        "fcmToken",
        token
    );


    return {

        token,
        registration,
        messaging

    };

}


// ========================================
// Firebaseへ端末登録
// ========================================

async function syncDevice(settings) {

    const {
        token,
        registration,
        messaging
    } =
        await getFcmToken();


    await registerPushDevice({

        token,

        deviceId:
            getDeviceId(),

        morningEnabled:
            settings.morningEnabled,

        morningTime:
            settings.morningTime,

        changeEnabled:
            settings.changeEnabled

    });


    if (!foregroundListenerStarted) {

        foregroundListenerStarted =
            true;


        onMessage(
            messaging,
            async payload => {

                const title =
                    payload.notification?.title ||
                    payload.data?.title ||
                    "TIME";


                const body =
                    payload.notification?.body ||
                    payload.data?.body ||
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

    }

}


// ========================================
// 通知有効化
// ========================================

async function enableNotifications() {

    try {

        setStatus(
            "通知を設定しています..."
        );


        if (!("serviceWorker" in navigator)) {

            throw new Error(
                "Service Workerに対応していません"
            );

        }


        if (!("Notification" in window)) {

            throw new Error(
                "通知に対応していません"
            );

        }


        const supported =
            await isSupported();


        if (!supported) {

            throw new Error(
                "Firebase通知に対応していません"
            );

        }


        let permission =
            Notification.permission;


        if (permission === "default") {

            permission =
                await Notification.requestPermission();

        }


        if (permission !== "granted") {

            throw new Error(
                "通知が許可されていません"
            );

        }


        const settings =
            getSavedSettings();


        applySettingsToForm(
            settings
        );


        await syncDevice(
            settings
        );


        showNotificationSettings();


        setStatus(
            "この端末の通知を登録しました"
        );


    } catch (error) {

        console.error(
            "通知設定エラー:",
            error
        );


        setStatus(
            error.message
        );


        alert(
            `通知設定でエラーが発生しました\n${error.message}`
        );

    }

}


// ========================================
// 設定保存
// ========================================

async function saveNotificationSettings() {

    try {

        const settings =
            getSettingsFromForm();


        saveSettingsLocally(
            settings
        );


        setStatus(
            "保存しています..."
        );


        if (
            Notification.permission !==
            "granted"
        ) {

            await enableNotifications();

            return;

        }


        await syncDevice(
            settings
        );


        setStatus(
            "設定を保存しました"
        );


    } catch (error) {

        console.error(
            "通知設定保存エラー:",
            error
        );


        setStatus(
            `保存できませんでした：${error.message}`
        );

    }

}


// ========================================
// 初期化
// ========================================

export function initializeNotificationSettings() {

    const button =
        document.getElementById(
            "notification-button"
        );


    const saveButton =
        document.getElementById(
            "save-notification-settings"
        );


    const morningEnabled =
        document.getElementById(
            "morning-notification-enabled"
        );


    const morningTime =
        document.getElementById(
            "morning-notification-time"
        );


    const settings =
        getSavedSettings();


    applySettingsToForm(
        settings
    );


    button?.addEventListener(
        "click",
        enableNotifications
    );


    saveButton?.addEventListener(
        "click",
        saveNotificationSettings
    );


    morningEnabled?.addEventListener(
        "change",
        () => {

            if (morningTime) {

                morningTime.disabled =
                    !morningEnabled.checked;

            }

        }
    );


    if (
        "Notification" in window &&
        Notification.permission ===
        "granted"
    ) {

        showNotificationSettings();


        syncDevice(
            settings
        ).catch(
            error => {

                console.error(
                    "通知端末同期エラー:",
                    error
                );

            }
        );

    }

}
