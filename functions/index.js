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
    onSchedule
} = require(
    "firebase-functions/v2/scheduler"
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


const {
    getMessaging
} = require(
    "firebase-admin/messaging"
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
// WebアプリURL
// ========================================

const APP_URL =
    "https://hakua34.github.io/timetable/";


// ========================================
// 教科
// ========================================

const subjects = {

    geography:
        "地理",

    classics:
        "古典",

    scienceChoice:
        "物理/生物",

    logicExpression3:
        "論表Ⅲ",

    chemistry:
        "化学",

    math3:
        "数学Ⅲ",

    topography:
        "地誌",

    pe:
        "体育",

    englishCommunication3:
        "英コミュⅢ",

    logicalJapanese:
        "論国",

    lhr:
        "LHR"

};


// ========================================
// 通常時間割
// ========================================

const timetable = {

    monday: [
        "geography",
        "classics",
        "scienceChoice",
        "logicExpression3",
        "chemistry",
        "math3"
    ],

    tuesday: [
        "topography",
        "pe",
        "math3",
        "englishCommunication3",
        "scienceChoice",
        null
    ],

    wednesday: [
        "math3",
        "logicalJapanese",
        "geography",
        "pe",
        "chemistry",
        "lhr"
    ],

    thursday: [
        "math3",
        "scienceChoice",
        "topography",
        "chemistry",
        "classics",
        "englishCommunication3"
    ],

    friday: [
        "logicalJapanese",
        "pe",
        "englishCommunication3",
        "math3",
        "math3",
        "logicExpression3"
    ]

};


// ========================================
// カセット時間割
// ========================================

const cassetteTimetable = [

    "geography",
    "scienceChoice",
    "chemistry",
    "math3",
    "englishCommunication3",
    null

];


// ========================================
// 授業時間
// ========================================

const schedules = {

    normal: [

        {
            start: "08:25",
            end: "09:25"
        },

        {
            start: "09:35",
            end: "10:35"
        },

        {
            start: "10:45",
            end: "11:45"
        },

        {
            start: "12:35",
            end: "13:35"
        },

        {
            start: "13:45",
            end: "14:45"
        },

        {
            start: "14:55",
            end: "15:55"
        }

    ],


    short55: [

        {
            start: "08:25",
            end: "09:20"
        },

        {
            start: "09:30",
            end: "10:25"
        },

        {
            start: "10:35",
            end: "11:30"
        },

        {
            start: "11:40",
            end: "12:35"
        },

        {
            start: "13:25",
            end: "14:20"
        },

        {
            start: "14:30",
            end: "15:25"
        }

    ],


    short50: [

        {
            start: "08:25",
            end: "09:15"
        },

        {
            start: "09:25",
            end: "10:15"
        },

        {
            start: "10:25",
            end: "11:15"
        },

        {
            start: "11:25",
            end: "12:15"
        },

        {
            start: "13:05",
            end: "13:55"
        },

        {
            start: "14:05",
            end: "14:55"
        }

    ],


    morning: [

        {
            start: "08:25",
            end: "09:25"
        },

        {
            start: "09:35",
            end: "10:35"
        },

        {
            start: "10:45",
            end: "11:45"
        },

        {
            start: "12:35",
            end: "13:35"
        },

        {
            start: "13:45",
            end: "14:45"
        },

        {
            start: "14:55",
            end: "15:55"
        }

    ]

};


// ========================================
// 日本時間取得
// ========================================

function getJapanDateTime() {

    const now =
        new Date();


    const formatter =
        new Intl.DateTimeFormat(
            "en-CA",
            {

                timeZone:
                    "Asia/Tokyo",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hourCycle:
                    "h23"

            }
        );


    const parts =
        formatter
            .formatToParts(now);


    const values = {};


    parts.forEach(
        part => {

            if (
                part.type !==
                "literal"
            ) {

                values[part.type] =
                    part.value;

            }

        }
    );


    const weekday =
        new Intl.DateTimeFormat(
            "en-US",
            {

                timeZone:
                    "Asia/Tokyo",

                weekday:
                    "long"

            }
        )
            .format(now)
            .toLowerCase();


    return {

        dateKey:
            `${values.year}-${values.month}-${values.day}`,

        time:
            `${values.hour}:${values.minute}`,

        weekday

    };

}


// ========================================
// ベース時間割
// ========================================

function getBaseTimetable(
    weekday,
    dayData,
    scheduleType
) {

    // テスト日程は
    // 通常時間割をベースにしない
    if (
        scheduleType ===
        "test"
    ) {

        return [
            null,
            null,
            null,
            null,
            null,
            null
        ];

    }


    if (
        dayData?.timetableType ===
        "cassette"
    ) {

        return [
            ...cassetteTimetable
        ];

    }


    if (
        timetable[weekday]
    ) {

        return [
            ...timetable[weekday]
        ];

    }


    return [
        null,
        null,
        null,
        null,
        null,
        null
    ];

}


// ========================================
// 授業時間取得
// ========================================

function getSchedulePeriods(
    dayData,
    scheduleType
) {

    const customPeriods =
        dayData?.schedule?.periods;


    if (customPeriods) {

        return Array.from(
            {
                length: 6
            },
            (_, index) => {

                return (
                    customPeriods[index] ||
                    customPeriods[String(index)] ||
                    {
                        start: "",
                        end: ""
                    }
                );

            }
        );

    }


    return (
        schedules[scheduleType] ||
        schedules.normal
    );

}


// ========================================
// 変更後の教科名
// ========================================

function getChangedSubjectName(
    change,
    originalSubjectId
) {

    if (!change) {

        return originalSubjectId
            ? subjects[originalSubjectId] ||
                originalSubjectId
            : "授業なし";

    }


    if (
        !change.subject
    ) {

        return originalSubjectId
            ? subjects[originalSubjectId] ||
                originalSubjectId
            : "授業なし";

    }


    if (
        change.subject ===
        "__none__"
    ) {

        return "授業なし";

    }


    if (
        change.subject ===
        "__custom__"
    ) {

        return (
            change.customSubject?.trim() ||
            "その他"
        );

    }


    return (
        subjects[change.subject] ||
        change.customSubject?.trim() ||
        change.subject
    );

}


// ========================================
// 科目変更か
// ========================================

function hasSubjectChange(
    change,
    originalSubjectId
) {

    if (
        !change ||
        !change.subject
    ) {

        return false;

    }


    if (
        change.subject ===
        "__none__"
    ) {

        return (
            originalSubjectId !==
            null &&
            originalSubjectId !==
            undefined
        );

    }


    if (
        change.subject ===
        "__custom__"
    ) {

        const originalName =
            originalSubjectId
                ? subjects[originalSubjectId] || ""
                : "";


        const changedName =
            change.customSubject?.trim() ||
            "その他";


        return (
            originalName !==
            changedName
        );

    }


    return (
        change.subject !==
        originalSubjectId
    );

}


// ========================================
// 実際の1〜6限を作成
// ========================================

function buildFinalTimetable(
    weekday,
    dayData
) {

    const scheduleType =
        dayData?.scheduleType ||
        "normal";


    const isTestSchedule =
        scheduleType ===
        "test";


    const base =
        getBaseTimetable(
            weekday,
            dayData,
            scheduleType
        );


    const changes =
        dayData?.periods ||
        {};


    const periods =
        [];


    for (
        let index = 0;
        index < 6;
        index++
    ) {

        const periodNumber =
            index + 1;


        const change =
            changes[periodNumber] ||
            changes[String(periodNumber)] ||
            null;


        const originalSubjectId =
            base[index] ||
            null;


        const name =
            getChangedSubjectName(
                change,
                originalSubjectId
            );


        const subjectChanged =
            !isTestSchedule &&
            hasSubjectChange(
                change,
                originalSubjectId
            );


        periods.push({

            name,

            originalSubjectId,

            change,

            subjectChanged

        });

    }


    return {

        periods,

        scheduleType,

        isTestSchedule

    };

}


// ========================================
// 意味のある変更か
// ========================================

function hasMeaningfulChange(
    period
) {

    const change =
        period.change;


    if (!change) {

        return false;

    }


    if (
        period.subjectChanged
    ) {

        return true;

    }


    if (
        typeof change.room ===
            "string" &&
        change.room.trim()
    ) {

        return true;

    }


    if (
        typeof change.note ===
            "string" &&
        change.note.trim()
    ) {

        return true;

    }


    return false;

}


// ========================================
// 朝通知本文
// ========================================

function createMorningBody(
    finalTimetable
) {

    return finalTimetable.periods
        .map(
            (
                period,
                index
            ) => {

                const changed =
                    period.subjectChanged
                        ? " ※変更"
                        : "";


                return (
                    `${index + 1}. ` +
                    `${period.name}` +
                    changed
                );

            }
        )
        .join("\n");

}


// ========================================
// 変更通知本文
// ========================================

function createChangeBody(
    period
) {

    const change =
        period.change ||
        {};


    let firstLine =
        period.name;


    if (
        typeof change.room ===
            "string" &&
        change.room.trim()
    ) {

        firstLine +=
            ` ー ${change.room.trim()}`;

    }


    if (
        typeof change.note ===
            "string" &&
        change.note.trim()
    ) {

        return (
            `${firstLine}\n` +
            `${change.note.trim()}`
        );

    }


    return firstLine;

}


// ========================================
// 無効トークン判定
// ========================================

function isInvalidTokenError(
    error
) {

    const code =
        error?.code ||
        "";


    return (
        code ===
            "messaging/registration-token-not-registered" ||
        code ===
            "messaging/invalid-registration-token"
    );

}


// ========================================
// FCM一括送信
// ========================================

async function sendToDevices(
    devices,
    message,
    successData
) {

    if (!devices.length) {

        return;

    }


    const database =
        getDatabase();


    const messaging =
        getMessaging();


    const maxTokens =
        500;


    for (
        let start = 0;
        start < devices.length;
        start += maxTokens
    ) {

        const chunk =
            devices.slice(
                start,
                start + maxTokens
            );


        const tokens =
            chunk.map(
                item => item.device.token
            );


        const response =
            await messaging
                .sendEachForMulticast({

                    tokens,

                    notification:
                        message.notification,

                    data:
                        message.data,

                    webpush: {

                        fcmOptions: {

                            link:
                                APP_URL

                        }

                    }

                });


        const updates =
            {};


        response.responses
            .forEach(
                (
                    result,
                    index
                ) => {

                    const item =
                        chunk[index];


                    const devicePath =
                        `pushDevices/${item.key}`;


                    if (
                        result.success
                    ) {

                        Object.entries(
                            successData
                        )
                            .forEach(
                                ([
                                    key,
                                    value
                                ]) => {

                                    updates[
                                        `${devicePath}/${key}`
                                    ] =
                                        value;

                                }
                            );


                        return;

                    }


                    console.error(
                        "通知送信エラー:",
                        item.key,
                        result.error
                    );


                    if (
                        isInvalidTokenError(
                            result.error
                        )
                    ) {

                        updates[
                            devicePath
                        ] =
                            null;

                    }

                }
            );


        if (
            Object.keys(updates)
                .length
        ) {

            await database
                .ref()
                .update(
                    updates
                );

        }

    }

}


// ========================================
// 通知端末登録
// ========================================

exports.registerPushDevice =
    onCall(
        async request => {

            const data =
                request.data ||
                {};


            const token =
                typeof data.token ===
                    "string"
                    ? data.token.trim()
                    : "";


            const deviceId =
                typeof data.deviceId ===
                    "string"
                    ? data.deviceId.trim()
                    : "";


            const morningEnabled =
                data.morningEnabled ===
                true;


            const changeEnabled =
                data.changeEnabled ===
                true;


            const morningTime =
                typeof data.morningTime ===
                    "string"
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
            // 端末キー生成
            // ========================================

            const deviceKey =
                crypto
                    .createHash("sha256")
                    .update(deviceId)
                    .digest("hex");


            // ========================================
            // Firebaseへ保存
            // ========================================

            await getDatabase()
                .ref(
                    `pushDevices/${deviceKey}`
                )
                .update({

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


// ========================================
// 自動通知
// 毎分チェック
// ========================================

exports.sendScheduledNotifications =
    onSchedule(
        {

            schedule:
                "* * * * *",

            timeZone:
                "Asia/Tokyo",

            retryCount:
                0,

            maxInstances:
                1

        },
        async () => {

            const now =
                getJapanDateTime();


            console.log(
                "通知チェック:",
                now.dateKey,
                now.time
            );


            const database =
                getDatabase();


            const [
                devicesSnapshot,
                daySnapshot
            ] =
                await Promise.all([

                    database
                        .ref(
                            "pushDevices"
                        )
                        .get(),

                    database
                        .ref(
                            `days/${now.dateKey}`
                        )
                        .get()

                ]);


            const devicesData =
                devicesSnapshot.val() ||
                {};


            const dayData =
                daySnapshot.val() ||
                null;


            const devices =
                Object.entries(
                    devicesData
                )
                    .map(
                        ([
                            key,
                            device
                        ]) => {

                            return {

                                key,
                                device

                            };

                        }
                    )
                    .filter(
                        item => {

                            return (
                                typeof item.device
                                    ?.token ===
                                    "string" &&
                                item.device.token
                                    .length > 50
                            );

                        }
                    );


            if (!devices.length) {

                console.log(
                    "通知端末なし"
                );

                return;

            }


            const finalTimetable =
                buildFinalTimetable(
                    now.weekday,
                    dayData
                );


            // ========================================
            // 朝の時間割通知
            // ========================================

            const morningDevices =
                devices.filter(
                    item => {

                        const device =
                            item.device;


                        return (

                            device
                                .morningEnabled ===
                                true &&

                            device
                                .morningTime ===
                                now.time &&

                            device
                                .lastMorningDate !==
                                now.dateKey

                        );

                    }
                );


            if (
                morningDevices.length
            ) {

                const body =
                    createMorningBody(
                        finalTimetable
                    );


                await sendToDevices(
                    morningDevices,
                    {

                        notification: {

                            title:
                                "今日の時間割",

                            body

                        },

                        data: {

                            type:
                                "morning",

                            date:
                                now.dateKey

                        }

                    },
                    {

                        lastMorningDate:
                            now.dateKey

                    }
                );


                console.log(
                    "朝通知:",
                    morningDevices.length
                );

            }


            // ========================================
            // テスト日程では
            // 授業変更通知を送らない
            // ========================================

            if (
                finalTimetable
                    .isTestSchedule
            ) {

                return;

            }


            const schedulePeriods =
                getSchedulePeriods(
                    dayData,
                    finalTimetable
                        .scheduleType
                );


            // ========================================
            // 2〜6限
            //
            // 直前の授業終了時刻
            // ＝休み時間開始
            // ========================================

            for (
                let periodIndex = 1;
                periodIndex < 6;
                periodIndex++
            ) {

                const periodNumber =
                    periodIndex + 1;


                const previousPeriod =
                    schedulePeriods[
                        periodIndex - 1
                    ];


                if (
                    !previousPeriod ||
                    !previousPeriod.end
                ) {

                    continue;

                }


                if (
                    previousPeriod.end !==
                    now.time
                ) {

                    continue;

                }


                const period =
                    finalTimetable
                        .periods[
                            periodIndex
                        ];


                if (
                    !hasMeaningfulChange(
                        period
                    )
                ) {

                    continue;

                }


                const changeKey =
                    `${now.dateKey}-${periodNumber}`;


                const changeDevices =
                    devices.filter(
                        item => {

                            const device =
                                item.device;


                            return (

                                device
                                    .changeEnabled ===
                                    true &&

                                device
                                    .lastChangeKey !==
                                    changeKey

                            );

                        }
                    );


                if (
                    !changeDevices.length
                ) {

                    continue;

                }


                const body =
                    createChangeBody(
                        period
                    );


                await sendToDevices(
                    changeDevices,
                    {

                        notification: {

                            title:
                                "次の授業に変更あり",

                            body

                        },

                        data: {

                            type:
                                "change",

                            date:
                                now.dateKey,

                            period:
                                String(
                                    periodNumber
                                )

                        }

                    },
                    {

                        lastChangeKey:
                            changeKey

                    }
                );


                console.log(
                    "授業変更通知:",
                    `${periodNumber}限`,
                    changeDevices.length
                );

            }

        }
    );