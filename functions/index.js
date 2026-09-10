// ========================================
// Firebase Functions
// ========================================

const {
    setGlobalOptions
} = require(
    "firebase-functions/v2"
);


const {
    onCall,
    HttpsError
} = require(
    "firebase-functions/v2/https"
);


const {
    initializeApp
} = require(
    "firebase-admin/app"
);


const {
    getDatabase
} = require(
    "firebase-admin/database"
);


const crypto =
    require("crypto");


// ========================================
// 共通設定
// ========================================

setGlobalOptions({

    region:
        "asia-southeast1",

    maxInstances:
        5

});


// ========================================
// Firebase Admin
// ========================================

initializeApp({

    databaseURL:
        "https://hakuafes-2026-34-default-rtdb.asia-southeast1.firebasedatabase.app"

});


// ========================================
// 通知端末登録
// ========================================

exports.registerPushDevice =
    onCall(
        async request => {

            const data =
                request.data || {};


            const token =
                typeof data.token === "string"
                    ? data.token.trim()
                    : "";


            const deviceId =
                typeof data.deviceId === "string"
                    ? data.deviceId.trim()
                    : "";


            const morningEnabled =
                data.morningEnabled === true;


            const changeEnabled =
                data.changeEnabled === true;


            const morningTime =
                typeof data.morningTime === "string"
                    ? data.morningTime
                    : "07:00";


            // ========================================
            // 入力チェック
            // ========================================

            if (
                token.length < 50 ||
                token.length > 4096
            ) {

                throw new HttpsError(
                    "invalid-argument",
                    "FCMトークンが正しくありません"
                );

            }


            if (
                deviceId.length < 8 ||
                deviceId.length > 200
            ) {

                throw new HttpsError(
                    "invalid-argument",
                    "端末IDが正しくありません"
                );

            }


            if (
                !/^(?:[01]\d|2[0-3]):[0-5]\d$/
                    .test(morningTime)
            ) {

                throw new HttpsError(
                    "invalid-argument",
                    "通知時刻が正しくありません"
                );

            }


            // ========================================
            // 端末IDをそのままDBキーにしない
            // ========================================

            const deviceKey =
                crypto
                    .createHash("sha256")
                    .update(deviceId)
                    .digest("hex");


            // ========================================
            // Firebaseに保存
            // ========================================

            await getDatabase()
                .ref(
                    `pushDevices/${deviceKey}`
                )
                .set({

                    token,

                    morningEnabled,

                    morningTime,

                    changeEnabled,

                    timezone:
                        "Asia/Tokyo",

                    updatedAt:
                        Date.now()

                });


            return {

                ok: true

            };

        }
    );