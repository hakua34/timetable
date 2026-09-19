import {
    subjects,
    timetable,
    specialTimetables,
    schedules
} from "./config.js";

import {
    getDayData,
    saveDayData
} from "./firebase.js";

const monthTitle =
    document.getElementById("calendar-month");

const calendarGrid =
    document.getElementById("calendar-grid");

const prevButton =
    document.getElementById("calendar-prev");

const nextButton =
    document.getElementById("calendar-next");

const selectedDateElement =
    document.getElementById("selected-date");

const selectedWeekdayElement =
    document.getElementById("selected-weekday");

const dayInfo =
    document.getElementById("day-info");

const editScheduleName =
    document.getElementById("edit-schedule-name");
// ========================================
// 編集画面 DOM
// ========================================

const dayEditButton =
    document.getElementById("day-edit-button");

const dayEditOverlay =
    document.getElementById("day-edit-overlay");

const dayEditBackground =
    document.getElementById("day-edit-background");

const dayEditClose =
    document.getElementById("day-edit-close");

const dayEditCancel =
    document.getElementById("day-edit-cancel");

const dayEditSave =
    document.getElementById("day-edit-save");

const dayEditTitle =
    document.getElementById("day-edit-title");

const editTimetableType =
    document.getElementById("edit-timetable-type");

const editScheduleType =
    document.getElementById("edit-schedule-type");

const editPeriods =
    document.getElementById("edit-periods");

const editDayNote =
    document.getElementById("edit-day-note");


// ========================================
// 基本設定
// ========================================

const weekdayNames = [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日"
];

const weekdayKeys = [
    null,
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    null
];


const today = new Date();

today.setHours(0, 0, 0, 0);


// 現在表示している月
let displayYear = today.getFullYear();
let displayMonth = today.getMonth();


// 選択中の日
let selectedDate = new Date(today);


// ========================================
// 同じ日か
// ========================================

function isSameDate(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}


// ========================================
// カレンダー生成
// ========================================

function renderCalendar() {

    calendarGrid.innerHTML = "";

    monthTitle.textContent =
        `${displayYear}年${displayMonth + 1}月`;


    // 月初
    const firstDay =
        new Date(
            displayYear,
            displayMonth,
            1
        );


    // 月末の日
    const lastDate =
        new Date(
            displayYear,
            displayMonth + 1,
            0
        ).getDate();


    /*
        JavaScript
        日=0 月=1 火=2...

        今回の表示
        月=0 火=1 ... 日=6
    */
    const startPosition =
        (firstDay.getDay() + 6) % 7;


    // 月初までの空白
    for (
        let i = 0;
        i < startPosition;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-empty";

        calendarGrid.appendChild(empty);

    }


    // 日付
    for (
        let date = 1;
        date <= lastDate;
        date++
    ) {

        const targetDate =
            new Date(
                displayYear,
                displayMonth,
                date
            );


        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "calendar-day";

        button.textContent = date;


        // 土日
        if (targetDate.getDay() === 6) {
            button.classList.add("saturday");
        }

        if (targetDate.getDay() === 0) {
            button.classList.add("sunday");
        }


        // 今日
        if (isSameDate(targetDate, today)) {
            button.classList.add("today");
        }


        // 選択中
        if (
            isSameDate(
                targetDate,
                selectedDate
            )
        ) {

            button.classList.add("selected");

        }


        button.addEventListener(
            "click",
            () => {

                selectedDate =
                    new Date(targetDate);

                renderCalendar();
                renderSelectedDay();

            }
        );


        calendarGrid.appendChild(button);

    }

}


// ========================================
// 選択日の情報
// ========================================

async function renderSelectedDay() {

    const targetDate =
        new Date(selectedDate);

    const month =
        targetDate.getMonth() + 1;

    const date =
        targetDate.getDate();

    const weekday =
        targetDate.getDay();

    const weekdayKey =
        weekdayKeys[weekday];


    selectedDateElement.textContent =
        `${month}月${date}日`;

    selectedWeekdayElement.textContent =
        weekdayNames[weekday];


    // 読み込み中
    dayInfo.innerHTML = `
        <div class="day-loading">
            読み込み中...
        </div>
    `;


    // Firebaseから取得
    const dayData =
        await getDayData(targetDate);


    // 別の日を押していたら描画しない
    if (!isSameDate(targetDate, selectedDate)) {
        return;
    }
    // ====================================
    // 休日
    // ====================================

    if (
        dayData?.scheduleType ===
        "holiday"
    ) {

        dayInfo.innerHTML = `

            <div class="no-school-day">
                休日
            </div>

            ${
                dayData?.note
                    ? `
                        <div class="day-note">

                            <div class="day-note-label">
                                備考
                            </div>

                            ${dayData.note}

                        </div>
                    `
                    : ""
            }

        `;

        return;
    }


    // ====================================
    // 土日
    // ====================================

    if (!weekdayKey && !dayData) {

        dayInfo.innerHTML = `
            <div class="no-school-day">
                授業はありません
            </div>
        `;

        return;
    }


    // ====================================
    // 時間割パターン
    // ====================================

    let timetableName;
    let classes;


    if (
        dayData?.timetableType === "cassette"
    ) {

        timetableName =
            specialTimetables.cassette.name;

        classes =
            specialTimetables.cassette.subjects;

    } else if (weekdayKey) {

        timetableName =
            `通常（${weekdayNames[weekday]}）`;

        classes =
            timetable[weekdayKey];

    } else {

        classes = [];
        timetableName = "なし";

    }


    // ====================================
    // 授業時間パターン
    // ====================================

    const scheduleType =
        dayData?.scheduleType || "normal";

    const schedule =
        dayData?.schedule?.periods
            ? dayData.schedule
            : schedules[scheduleType] || schedules.normal;


    // ====================================
    // その日の最終時間割を作る
    // ====================================

    const periodChanges =
        dayData?.periods || {};

    const isTestSchedule =
        scheduleType === "test";


    const timetableRows =
        Array.from(
            {
                length: 6
            },
            (_, index) => {

                const periodNumber =
                    index + 1;

                const change =
                    periodChanges[periodNumber] ||
                    {};

                const originalSubjectId =
                    isTestSchedule
                        ? null
                        : classes[index] || null;


                let subjectName =
                    originalSubjectId
                        ? subjects[originalSubjectId]?.name ||
                            "授業なし"
                        : "授業なし";


                // 授業なし
                if (
                    change.subject ===
                    "__none__"
                ) {

                    subjectName =
                        "授業なし";

                }


                // その他
                else if (
                    change.subject ===
                    "__custom__"
                ) {

                    subjectName =
                        change.customSubject?.trim() ||
                        "その他";

                }


                // 通常教科
                else if (change.subject) {

                    subjectName =
                        subjects[change.subject]?.name ||
                        change.subject;

                }


                const period =
                    schedule.periods?.[index] ||
                    {};

                const timeText =
                    period.start &&
                    period.end
                        ? `${period.start} - ${period.end}`
                        : "";


                const hasChange =
                    !isTestSchedule &&
                    !!(
                        change.subject ||
                        change.room ||
                        change.note
                    );


                const isEmpty =
                    subjectName ===
                    "授業なし";


                return `

                    <div
                        class="
                            calendar-timetable-row
                            ${hasChange ? "changed" : ""}
                            ${isEmpty ? "empty" : ""}
                        "
                    >

                        <div class="calendar-timetable-period">
                            ${periodNumber}限
                        </div>


                        <div class="calendar-timetable-main">

                            <div class="calendar-timetable-subject">

                                ${subjectName}

                                ${
                                    hasChange
                                        ? `
                                            <span class="calendar-timetable-change">
                                                変更
                                            </span>
                                        `
                                        : ""
                                }

                            </div>


                            ${
                                change.room
                                    ? `
                                        <div class="calendar-timetable-detail">
                                            教室：${change.room}
                                        </div>
                                    `
                                    : ""
                            }


                            ${
                                change.note
                                    ? `
                                        <div class="calendar-timetable-detail">
                                            ${change.note}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="calendar-timetable-time">
                            ${timeText}
                        </div>

                    </div>

                `;

            }
        )
        .join("");


    const changeCount =
        isTestSchedule
            ? 0
            : Object.values(periodChanges)
                .filter(change => {

                    return !!(
                        change.subject ||
                        change.room ||
                        change.note
                    );

                })
                .length;

    // ====================================
    // 描画
    // ====================================

    dayInfo.innerHTML = `

        <div class="day-info-row">

            <span class="day-info-label">
                時間割
            </span>

            <strong>
                ${timetableName}
            </strong>

        </div>


        <div class="day-info-row">

            <span class="day-info-label">
                授業時間
            </span>

            <strong>
                ${schedule.name}
            </strong>

        </div>


        <div class="day-info-row">

            <span class="day-info-label">
                変更
            </span>

            <span class="${changeCount ? "has-change" : "no-change"}">
                ${
                    changeCount
                        ? `${changeCount}件`
                        : "なし"
                }
            </span>

        </div>


        <div class="calendar-timetable">
            ${timetableRows}
        </div>


        ${
            dayData?.note
                ? `
                    <div class="day-note">

                        <div class="day-note-label">
                            備考
                        </div>

                        ${dayData.note}

                    </div>
                `
                : ""
        }

    `;
}


// ========================================
// 前月
// ========================================

prevButton.addEventListener(
    "click",
    () => {

        displayMonth--;

        if (displayMonth < 0) {

            displayMonth = 11;
            displayYear--;

        }

        renderCalendar();

    }
);


// ========================================
// 翌月
// ========================================

nextButton.addEventListener(
    "click",
    () => {

        displayMonth++;

        if (displayMonth > 11) {

            displayMonth = 0;
            displayYear++;

        }

        renderCalendar();

    }
);

// ========================================
// 編集画面
// ========================================

async function openDayEditor() {

    const date =
        new Date(selectedDate);

    const weekday =
        date.getDay();

    const weekdayKey =
        weekdayKeys[weekday];

    const dayData =
        await getDayData(date);


    // ----------------------------
    // タイトル
    // ----------------------------

    dayEditTitle.textContent =
        `${date.getMonth() + 1}月${date.getDate()}日（${weekdayNames[weekday]}）`;


    // ----------------------------
    // 時間割
    // ----------------------------

    editTimetableType.value =
        dayData?.timetableType === "cassette"
            ? "cassette"
            : "normal";


    // ----------------------------
    // 授業時間
    // ----------------------------

    editScheduleType.innerHTML = "";

    Object.entries(schedules)
        .forEach(([id, schedule]) => {

            const option =
                document.createElement("option");

            option.value = id;
            option.textContent = schedule.name;

            editScheduleType.appendChild(option);
        });

    editScheduleType.value =
        dayData?.scheduleType || "normal";
        const selectedSchedule =
            schedules[
                dayData?.scheduleType || "normal"
            ] || schedules.normal;

        editScheduleName.value =
            dayData?.schedule?.name ||
            selectedSchedule.name;

    // ----------------------------
    // 備考
    // ----------------------------

    editDayNote.value =
        dayData?.note || "";

        // ★ 1〜6限の編集欄を作る
        renderEditPeriods(
            weekdayKey,
            dayData
        );

    // ----------------------------
    // 授業一覧生成
    // ----------------------------

    function renderEditPeriods(
    weekdayKey,
    dayData
) {

    editPeriods.innerHTML = "";

    let baseClasses;

    if (
        editTimetableType.value === "cassette"
    ) {

        baseClasses =
            specialTimetables.cassette.subjects;

    } else {

        baseClasses =
            weekdayKey
                ? timetable[weekdayKey]
                : Array(6).fill(null);
    }


    const preset =
        schedules[editScheduleType.value] ||
        schedules.normal;

    const savedSchedule =
        dayData?.schedule;


    for (let i = 0; i < 6; i++) {

        const periodNumber = i + 1;

        const originalSubjectId =
            baseClasses[i];

        const originalSubject =
            subjects[originalSubjectId];

        const existingChange =
            dayData?.periods?.[periodNumber] || {};

        /*
         * 保存済みの個別時刻を優先。
         * なければプリセット。
         */
        const savedTime =
            savedSchedule?.periods?.[i];

        const presetTime =
            preset.periods?.[i];

        const start =
            savedTime?.start ??
            presetTime?.start ??
            "";

        const end =
            savedTime?.end ??
            presetTime?.end ??
            "";


        let subjectOptions = `

            <option value="">
                変更なし
            </option>

        `;


        Object.entries(subjects)
            .forEach(([id, subject]) => {

                const selected =
                    existingChange.subject === id
                        ? "selected"
                        : "";

                subjectOptions += `
                    <option
                        value="${id}"
                        ${selected}
                    >
                        ${subject.name}
                    </option>
                `;
            });


        // その他
        subjectOptions += `
            <option
                value="__custom__"
                ${
                    existingChange.subject === "__custom__"
                        ? "selected"
                        : ""
                }
            >
                その他
            </option>
        `;


        // 一番下に授業なし
        subjectOptions += `
            <option
                value="__none__"
                ${
                    existingChange.subject === "__none__"
                        ? "selected"
                        : ""
                }
            >
                授業なし
            </option>
        `;


        const row =
            document.createElement("div");

        row.className =
            "edit-period-row";


        row.innerHTML = `

            <div class="edit-period-heading">

                <strong>
                    ${periodNumber}限
                </strong>

                <span>
                    ${
                        originalSubject?.name ||
                        "授業なし"
                    }
                </span>

            </div>


            <div class="edit-period-fields">

                <select
                    class="edit-subject"
                    data-period="${periodNumber}"
                >
                    ${subjectOptions}
                </select>


                <input
                    class="edit-custom-subject"
                    data-period="${periodNumber}"
                    type="text"
                    placeholder="科目名を入力"
                    value="${
                        existingChange.customSubject || ""
                    }"
                    ${
                        existingChange.subject === "__custom__"
                            ? ""
                            : "hidden"
                    }
                >


                <input
                    class="edit-room"
                    data-period="${periodNumber}"
                    type="text"
                    placeholder="教室変更"
                    value="${existingChange.room || ""}"
                >


                <input
                    class="edit-note"
                    data-period="${periodNumber}"
                    type="text"
                    placeholder="備考"
                    value="${existingChange.note || ""}"
                >


                <div class="edit-time-row">

                    <span class="edit-time-label">
                        時間
                    </span>

                    <input
                        class="edit-start-time"
                        data-period="${periodNumber}"
                        type="time"
                        value="${start}"
                    >

                    <span>～</span>

                    <input
                        class="edit-end-time"
                        data-period="${periodNumber}"
                        type="time"
                        value="${end}"
                    >

                </div>

            </div>
        `;


        editPeriods.appendChild(row);
    }


    // 「その他」選択時だけ自由記述を表示
    editPeriods
        .querySelectorAll(".edit-subject")
        .forEach(select => {

            select.addEventListener(
                "change",
                () => {

                    const period =
                        select.dataset.period;

                    const customInput =
                        editPeriods.querySelector(
                            `.edit-custom-subject[data-period="${period}"]`
                        );

                    customInput.hidden =
                        select.value !== "__custom__";
                }
            );

        });
}


    dayEditOverlay.classList.add("show");
}


// ========================================
// 編集する授業一覧
// ========================================

function renderEditPeriods(
    weekdayKey,
    dayData
) {

    editPeriods.innerHTML = "";


    // ========================================
    // 基準になる時間割
    // ========================================

    let baseClasses;

    if (
        editTimetableType.value === "cassette"
    ) {

        baseClasses =
            specialTimetables.cassette.subjects;

    } else {

        baseClasses =
            weekdayKey
                ? timetable[weekdayKey]
                : Array(6).fill(null);
    }


    // ========================================
    // 授業時間
    // ========================================

    const preset =
        schedules[editScheduleType.value] ||
        schedules.normal;

    const savedSchedule =
        dayData?.schedule;


    // ========================================
    // 1〜6限
    // ========================================

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const periodNumber =
            i + 1;


        const originalSubjectId =
            baseClasses[i];

        const originalSubject =
            subjects[originalSubjectId];


        const existingChange =
            dayData?.periods?.[periodNumber] || {};


        // ====================================
        // 時間
        // ====================================

        const savedTime =
            savedSchedule?.periods?.[i];

        const presetTime =
            preset.periods?.[i];


        const start =
            savedTime?.start ??
            presetTime?.start ??
            "";

        const end =
            savedTime?.end ??
            presetTime?.end ??
            "";


        // ====================================
        // 教科選択肢
        // ====================================

        let subjectOptions = `
            <option value="">
                変更なし
            </option>
        `;


        // 通常教科
        Object.entries(subjects)
            .forEach(([id, subject]) => {

                const selected =
                    existingChange.subject === id
                        ? "selected"
                        : "";

                subjectOptions += `
                    <option
                        value="${id}"
                        ${selected}
                    >
                        ${subject.name}
                    </option>
                `;
            });


        // その他
        subjectOptions += `
            <option
                value="__custom__"
                ${
                    existingChange.subject === "__custom__"
                        ? "selected"
                        : ""
                }
            >
                その他
            </option>
        `;


        // 授業なし
        subjectOptions += `
            <option
                value="__none__"
                ${
                    existingChange.subject === "__none__"
                        ? "selected"
                        : ""
                }
            >
                授業なし
            </option>
        `;


        // ====================================
        // 行作成
        // ====================================

        const row =
            document.createElement("div");

        row.className =
            "edit-period-row";


        row.innerHTML = `

            <div class="edit-period-heading">

                <strong>
                    ${periodNumber}限
                </strong>

                <span>
                    ${
                        originalSubject?.name ||
                        "授業なし"
                    }
                </span>

            </div>


            <div class="edit-period-fields">

                <select
                    class="edit-subject"
                    data-period="${periodNumber}"
                >
                    ${subjectOptions}
                </select>


                <input
                    class="edit-custom-subject"
                    data-period="${periodNumber}"
                    type="text"
                    placeholder="科目名を入力"
                    value="${
                        existingChange.customSubject || ""
                    }"
                    ${
                        existingChange.subject === "__custom__"
                            ? ""
                            : "hidden"
                    }
                >


                <input
                    class="edit-room"
                    data-period="${periodNumber}"
                    type="text"
                    placeholder="教室変更"
                    value="${existingChange.room || ""}"
                >


                <input
                    class="edit-note"
                    data-period="${periodNumber}"
                    type="text"
                    placeholder="備考"
                    value="${existingChange.note || ""}"
                >


                <div class="edit-time-row">

                    <span class="edit-time-label">
                        時間
                    </span>

                    <input
                        class="edit-start-time"
                        data-period="${periodNumber}"
                        type="time"
                        value="${start}"
                    >

                    <span>～</span>

                    <input
                        class="edit-end-time"
                        data-period="${periodNumber}"
                        type="time"
                        value="${end}"
                    >

                </div>

            </div>
        `;


        editPeriods.appendChild(row);
    }


    // ========================================
    // 「その他」選択時
    // ========================================

    editPeriods
        .querySelectorAll(".edit-subject")
        .forEach(select => {

            select.addEventListener(
                "change",
                () => {

                    const period =
                        select.dataset.period;

                    const customInput =
                        editPeriods.querySelector(
                            `.edit-custom-subject[data-period="${period}"]`
                        );


                    if (customInput) {

                        customInput.hidden =
                            select.value !== "__custom__";

                        if (
                            select.value !== "__custom__"
                        ) {

                            customInput.value = "";
                        }
                    }
                }
            );

        });
}

// ========================================
// 時間割パターン変更
// ========================================

editTimetableType.addEventListener(
    "change",
    async () => {

        const dayData =
            await getDayData(selectedDate);

        const weekdayKey =
            weekdayKeys[selectedDate.getDay()];

        renderEditPeriods(
            weekdayKey,
            dayData
        );
    }
);


// ========================================
// 編集画面を閉じる
// ========================================

function closeDayEditor() {

    dayEditOverlay.classList.remove("show");
}


dayEditButton?.addEventListener(
    "click",
    openDayEditor
);

dayEditClose.addEventListener(
    "click",
    closeDayEditor
);

dayEditCancel.addEventListener(
    "click",
    closeDayEditor
);

dayEditBackground.addEventListener(
    "click",
    closeDayEditor
);


// ========================================
// 保存
// ========================================

dayEditSave.addEventListener(
    "click",
    async () => {

        const periods = {};
        const schedulePeriods = [];

        for (let period = 1; period <= 6; period++) {

            const subject =
                document.querySelector(
                    `.edit-subject[data-period="${period}"]`
                ).value;

            const room =
                document.querySelector(
                    `.edit-room[data-period="${period}"]`
                ).value.trim();

            const note =
                document.querySelector(
                    `.edit-note[data-period="${period}"]`
                ).value.trim();

            const customSubject =
                document.querySelector(
                    `.edit-custom-subject[data-period="${period}"]`
                ).value.trim();

            const start =
                document.querySelector(
                    `.edit-start-time[data-period="${period}"]`
                ).value;

            const end =
                document.querySelector(
                    `.edit-end-time[data-period="${period}"]`
                ).value;


            schedulePeriods.push({
                start,
                end
            });

            // 何か設定されている場合だけ保存
            if (
                subject ||
                room ||
                note ||
                customSubject
            ) {

                // 最初に作る
                periods[period] = {};


                // 教科
                if (subject) {

                    periods[period].subject =
                        subject;
                }


                // その他（自由入力）
                if (
                    subject === "__custom__" &&
                    customSubject
                ) {

                    periods[period].customSubject =
                        customSubject;
                }


                // 教室
                if (room) {

                    periods[period].room =
                        room;
                }


                // 備考
                if (note) {

                    periods[period].note =
                        note;
                }
            }
        }


        const data = {

            timetableType:
                editTimetableType.value,

            scheduleType:
                editScheduleType.value,

            schedule: {

                name:
                    editScheduleName.value.trim() ||
                    schedules[
                        editScheduleType.value
                    ]?.name ||
                    "特別日程",

                periods:
                    schedulePeriods
            },

            periods,

            note:
                editDayNote.value.trim()

        };


        try {

            dayEditSave.disabled = true;
            dayEditSave.textContent =
                "保存中...";


            await saveDayData(
                selectedDate,
                data
            );


            closeDayEditor();

            // 表示をFirebaseから読み直す
            await renderSelectedDay();


        } catch (error) {

            console.error(
                "保存エラー:",
                error
            );

            alert(
                "保存に失敗しました"
            );

        } finally {

            dayEditSave.disabled = false;
            dayEditSave.textContent =
                "保存";
        }

    }
);

editScheduleType.addEventListener(
    "change",
    () => {

        const scheduleType =
            editScheduleType.value;

        const preset =
            schedules[scheduleType];

        if (!preset) {
            return;
        }


        // 日程名称
        editScheduleName.value =
            preset.name;


        for (
            let period = 1;
            period <= 6;
            period++
        ) {

            const time =
                preset.periods?.[
                    period - 1
                ] || {
                    start: "",
                    end: ""
                };


            const startInput =
                document.querySelector(
                    `.edit-start-time[data-period="${period}"]`
                );

            const endInput =
                document.querySelector(
                    `.edit-end-time[data-period="${period}"]`
                );

            const subjectSelect =
                document.querySelector(
                    `.edit-subject[data-period="${period}"]`
                );

            const customInput =
                document.querySelector(
                    `.edit-custom-subject[data-period="${period}"]`
                );


            // プリセット時間を反映
            if (startInput) {

                startInput.value =
                    time.start || "";
            }


            if (endInput) {

                endInput.value =
                    time.end || "";
            }


            // ========================================
            // テスト日程
            // ========================================

            if (
                scheduleType === "test" &&
                subjectSelect
            ) {

                // 1〜6限すべて授業なし
                subjectSelect.value =
                    "__none__";


                // 「その他」の入力欄もリセット
                if (customInput) {

                    customInput.value = "";

                    customInput.hidden = true;
                }
            }
        }
    }
);

// ========================================
// 初期表示
// ========================================

renderCalendar();
renderSelectedDay();