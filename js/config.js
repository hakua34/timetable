// ========================================
// 教科
// ========================================

export const subjects = {

    geography: {
        name: "地理",
        room: "",
        note: ""
    },

    classics: {
        name: "古典",
        room: "",
        note: ""
    },

    scienceChoice: {
        name: "物理/生物",
        room: "",
        note: ""
    },

    logicExpression3: {
        name: "論表Ⅲ",
        room: "",
        note: ""
    },

    chemistry: {
        name: "化学",
        room: "",
        note: ""
    },

    math3: {
        name: "数学Ⅲ",
        room: "",
        note: ""
    },

    topography: {
        name: "地誌",
        room: "",
        note: ""
    },

    pe: {
        name: "体育",
        room: "",
        note: ""
    },

    englishCommunication3: {
        name: "英コミュⅢ",
        room: "",
        note: ""
    },

    logicalJapanese: {
        name: "論国",
        room: "",
        note: ""
    },

    lhr: {
        name: "LHR",
        room: "",
        note: ""
    }
};


// ========================================
// 授業時間パターン
// ========================================

export const schedules = {

    normal: {
        name: "通常授業",
        periods: [
            { start: "08:25", end: "09:25" },
            { start: "09:35", end: "10:35" },
            { start: "10:45", end: "11:45" },
            { start: "12:35", end: "13:35" },
            { start: "13:45", end: "14:45" },
            { start: "14:55", end: "15:55" }
        ]
    },

    short55: {
        name: "短縮55分",
        periods: [
            { start: "08:25", end: "09:20" },
            { start: "09:30", end: "10:25" },
            { start: "10:35", end: "11:30" },
            { start: "11:40", end: "12:35" },
            { start: "13:25", end: "14:20" },
            { start: "14:30", end: "15:25" }
        ]
    },

    short50: {
        name: "短縮50分",
        periods: [
            { start: "08:25", end: "09:15" },
            { start: "09:25", end: "10:15" },
            { start: "10:25", end: "11:15" },
            { start: "11:25", end: "12:15" },
            { start: "13:05", end: "13:55" },
            { start: "14:05", end: "14:55" }
        ]
    },

    morning: {
        name: "午前授業",
        periods: [
            { start: "08:25", end: "09:25" },
            { start: "09:35", end: "10:35" },
            { start: "10:45", end: "11:45" },
            { start: "12:35", end: "13:35" },
            { start: "13:45", end: "14:45" },
            { start: "14:55", end: "15:55" }
        ]
    },

    test: {
        name: "テスト日程",
        periods: [
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" }
        ]
    },

    custom: {
        name: "その他",
        periods: [
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" },
            { start: "", end: "" }
        ]
    }

};


// ========================================
// 通常時間割
// ========================================

export const timetable = {

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
// 特別時間割
// ========================================

export const specialTimetables = {

    cassette: {
        name: "カセット日程",

        subjects: [
            "geography",
            "scienceChoice",
            "chemistry",
            "math3",
            "englishCommunication3",
            null
        ]
    }

};