import {
    subjects,
    timetable,
    schedules,
    specialTimetables
} from "./config.js";

import {
    getDayData
} from "./firebase.js";

// ========================================
// DOM
// ========================================

const currentArea =
    document.getElementById("current-area");

const nextCard =
    document.getElementById("next-card");

const classList =
    document.getElementById("class-list");

const scheduleBadge =
    document.querySelector(".schedule-badge");
// ========================================
// 曜日
// ========================================

const weekdayKeys = [
    null,        // 日
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    null         // 土
];


// ========================================
// 時刻 → 分
// ========================================

function timeToMinutes(time) {

    const [hour, minute] =
        time.split(":").map(Number);

    return hour * 60 + minute;
}


// ========================================
// 現在時刻
// ========================================

function getCurrentMinutes(date) {

    return (
        date.getHours() * 60 +
        date.getMinutes()
    );

}


// ========================================
// 今日の時間割
// ========================================

function getTodayTimetable(date) {

    const weekday =
        weekdayKeys[date.getDay()];

    if (!weekday) {
        return null;
    }

    return timetable[weekday];
}


// ========================================
// 次に存在する授業
// ========================================

function findNextExistingPeriod(
    todayTimetable,
    startIndex
) {

    for (
        let i = startIndex;
        i < todayTimetable.length;
        i++
    ) {

        if (todayTimetable[i]) {
            return i;
        }

    }

    return null;
}


// ========================================
// 現在状態判定
// ========================================

function getSchoolStatus(
    date,
    todayTimetable,
    schedule
) {

    const now =
        getCurrentMinutes(date);

    const periods =
        schedule.periods;


    // -------------------------------
    // 1限開始前
    // -------------------------------

    const firstPeriod =
        findNextExistingPeriod(
            todayTimetable,
            0
        );

    if (firstPeriod === null) {

        return {
            type: "no-classes"
        };

    }

    const firstStart =
        timeToMinutes(
            periods[firstPeriod].start
        );

    if (now < firstStart) {

        return {
            type: "before-school",
            nextIndex: firstPeriod,
            minutesUntil:
                firstStart - now
        };

    }


    // -------------------------------
    // 各授業を確認
    // -------------------------------

    for (
        let i = 0;
        i < periods.length;
        i++
    ) {

        if (!todayTimetable[i]) {
            continue;
        }

        const start =
            timeToMinutes(
                periods[i].start
            );

        const end =
            timeToMinutes(
                periods[i].end
            );


        // 授業中
        if (
            now >= start &&
            now < end
        ) {

            const nextIndex =
                findNextExistingPeriod(
                    todayTimetable,
                    i + 1
                );

            return {
                type: "class",
                currentIndex: i,
                nextIndex,
                remaining:
                    end - now
            };

        }


        // -------------------------------
        // この授業後〜次授業
        // -------------------------------

        if (now >= end) {

            const nextIndex =
                findNextExistingPeriod(
                    todayTimetable,
                    i + 1
                );

            if (nextIndex !== null) {

                const nextStart =
                    timeToMinutes(
                        periods[nextIndex].start
                    );

                if (
                    now >= end &&
                    now < nextStart
                ) {

                    return {
                        type: "break",
                        nextIndex,
                        minutesUntil:
                            nextStart - now
                    };

                }

            }

        }

    }


    // -------------------------------
    // 放課後
    // -------------------------------

    return {
        type: "after-school"
    };

}


// ========================================
// 現在エリア
// ========================================

function renderCurrent(
    status,
    todayTimetable,
    schedule
) {

    // 授業中
    if (status.type === "class") {

        const index =
            status.currentIndex;

        const subjectId =
            todayTimetable[index];

        const subject =
            subjects[subjectId];

        const period =
            schedule.periods[index];

        currentArea.innerHTML = `
            <div class="current-line">

                <span class="current-period">
                    ${index + 1}限
                </span>

                <strong class="current-name">
                    ${subject.name}
                </strong>

                <span class="current-time">
                    ${period.start} - ${period.end}
                </span>

                <span class="remaining">
                    残り
                    <strong>
                        ${status.remaining}分
                    </strong>
                </span>

            </div>
        `;

        return;
    }


    // 休み時間
    if (status.type === "break") {

        currentArea.innerHTML = `
            <div class="break-status">

                <span>
                    ${status.nextIndex + 1}限開始まで
                </span>

                <strong>
                    あと${status.minutesUntil}分
                </strong>

            </div>
        `;

        return;
    }


    // 登校前
    if (status.type === "before-school") {

        currentArea.innerHTML = `
            <div class="break-status">

                <span>
                    ${status.nextIndex + 1}限開始まで
                </span>

                <strong>
                    あと${status.minutesUntil}分
                </strong>

            </div>
        `;

        return;
    }


    // 放課後
    if (status.type === "after-school") {

        currentArea.innerHTML = `
            <div class="after-school">
                本日の授業は終了しました
            </div>
        `;

        return;
    }


    currentArea.innerHTML = "";

}


// ========================================
// NEXT
// ========================================

function renderNext(
    status,
    todayTimetable,
    schedule
) {

    const index =
        status.nextIndex;


    if (
        index === null ||
        index === undefined
    ) {

        nextCard.style.display =
            "none";

        return;
    }


    nextCard.style.display =
        "block";


    const subjectId =
        todayTimetable[index];

    const subject =
        subjects[subjectId];

    const period =
        schedule.periods[index];


    let detailHTML = "";


    if (subject.room) {

        detailHTML += `
            <div>
                ${subject.room}
            </div>
        `;

    }


    if (subject.note) {

        detailHTML += `
            <div class="note">
                ${subject.note}
            </div>
        `;

    }


    nextCard.innerHTML = `

        <div class="card-label">
            NEXT
        </div>

        <div class="next-title">

            <span class="period-number">
                ${index + 1}限
            </span>

            <span class="next-subject">
                ${subject.name}
            </span>

        </div>

        <div class="next-time">
            ${period.start} - ${period.end}
        </div>

        ${
            detailHTML
                ? `
                <div class="next-details">
                    ${detailHTML}
                </div>
                `
                : ""
        }

    `;

}

// ========================================
// 授業一覧
// ========================================

function renderClassList(
    status,
    todayTimetable,
    schedule,
    changes
) {

    classList.innerHTML = "";

    todayTimetable.forEach(
        (subjectId, index) => {

            // 授業なし
            if (!subjectId) {
                return;
            }


            const subject =
                subjects[subjectId];

            const period =
                schedule.periods[index];


            let stateClass = "";


            // 現在授業
            if (
                status.type === "class" &&
                status.currentIndex === index
            ) {

                stateClass = "current";

            }


            // 終了済み判定
            const now =
                getCurrentMinutes(
                    new Date()
                );

            const end =
                timeToMinutes(
                    period.end
                );

            if (
                now >= end &&
                !(
                    status.type === "class" &&
                    status.currentIndex === index
                )
            ) {

                stateClass =
                    "finished";

            }


            // この時限の変更内容
            const change =
                changes?.[index + 1];

            const isChanged =
                !!change;
            
            const hasDetails =
                !!(
                    change?.room ||
                    change?.note
                );
            
            
            // ========================================
            // 変更状態
            // ========================================
            
            let changeStateClass = "";
            
            if (isChanged) {
            
                if (stateClass === "finished") {
            
                    // 終了済み
                    changeStateClass =
                        "changed-finished";
            
                } else if (stateClass === "current") {
            
                    // 現在授業
                    changeStateClass =
                        "changed-current";
            
                } else {
            
                    // これからの授業
                    changeStateClass =
                        "changed-upcoming";
            
                }
            
            }
            
            
            const row =
                document.createElement(
                    "div"
                );
            
            row.className =
                `class-row ${stateClass} ${changeStateClass}`;


            row.innerHTML = `

                <div class="class-main-row">

                    <span class="class-period">
    						${index + 1}限
					</span>

                    <span class="class-name">
                        ${subject.name}
                    </span>

                    <span class="class-time">
                        ${period.start} - ${period.end}
                    </span>

                </div>

                ${
                    hasDetails
                        ? `
                            <div class="class-change-detail">

                                ${
                                    change?.room
                                        ? `
                                            <div class="class-change-room">
                                                教室：${change.room}
                                            </div>
                                        `
                                        : ""
                                }

                                ${
                                    change?.note
                                        ? `
                                            <div class="class-change-note">
                                                ${change.note}
                                            </div>
                                        `
                                        : ""
                                }

                            </div>
                        `
                        : ""
                }

            `;


            classList.appendChild(row);

        }
    );

}

function applyTodayDetails(
    todayTimetable,
    changes
) {

    // NEXTカード
    const nextSubjectElement =
        nextCard.querySelector(".next-subject");

    if (!nextSubjectElement) {
        return;
    }

    Object.entries(changes)
        .forEach(([period, change]) => {

            const periodNumber =
                Number(period);

            const statusPeriod =
                nextCard
                    .querySelector(".period-number")
                    ?.textContent;

            if (
                statusPeriod !==
                `${periodNumber}限`
            ) {
                return;
            }


            let details = [];


            if (change.room) {
                details.push(change.room);
            }

            if (change.note) {
                details.push(change.note);
            }


            if (details.length) {

                let detailBox =
                    nextCard.querySelector(
                        ".next-details"
                    );

                if (!detailBox) {

                    detailBox =
                        document.createElement(
                            "div"
                        );

                    detailBox.className =
                        "next-details";

                    nextCard.appendChild(
                        detailBox
                    );
                }

                detailBox.innerHTML =
                    details
                        .map(text =>
                            `<div>${text}</div>`
                        )
                        .join("");
            }

        });
}



// ========================================
// 今日画面更新
// ========================================

export async function updateToday() {

    const now = new Date();

    const weekday =
        weekdayKeys[now.getDay()];

    const dayData =
        await getDayData(now);


    // ========================================
    // 今日のベース時間割
    // ========================================

    let todayTimetable;

    if (
        dayData?.timetableType === "cassette"
    ) {

        todayTimetable =
            [...specialTimetables.cassette.subjects];

    } else if (weekday) {

        todayTimetable =
            [...timetable[weekday]];

    } else {

        todayTimetable = null;
    }


    // 土日かつ特別設定もない
    if (!todayTimetable) {

        currentArea.innerHTML = `
            <div class="after-school">
                今日は授業がありません
            </div>
        `;

        nextCard.style.display = "none";
        classList.innerHTML = "";

        return;
    }


    // ========================================
    // 各時限の変更を反映
    // ========================================

    const changes =
        dayData?.periods || {};

    Object.entries(changes)
        .forEach(([period, change]) => {

            const index =
                Number(period) - 1;


            // ========================================
            // 授業なし
            // ========================================

            if (
                change.subject === "__none__"
            ) {

                todayTimetable[index] = null;

                return;
            }


            // ========================================
            // その他
            // ========================================

            if (
                change.subject === "__custom__"
            ) {

                const customId =
                    `__custom_${index}`;

                subjects[customId] = {
                    name:
                        change.customSubject ||
                        "その他"
                };

                todayTimetable[index] =
                    customId;

                return;
            }


            // ========================================
            // 通常の教科変更
            // ========================================

            if (change.subject) {

                todayTimetable[index] =
                    change.subject;
            }

        });


    // ========================================
    // 授業時間パターン
    // ========================================

    const scheduleType =
        dayData?.scheduleType || "normal";

    const schedule =
        dayData?.schedule?.periods
            ? dayData.schedule
            : schedules[scheduleType] || schedules.normal;

    scheduleBadge.textContent =
        schedule.name ||
        schedules[scheduleType]?.name ||
        "通常授業";


    // ========================================
    // 状態判定
    // ========================================

    const status =
        getSchoolStatus(
            now,
            todayTimetable,
            schedule
        );


    renderCurrent(
        status,
        todayTimetable,
        schedule
    );

    renderNext(
        status,
        todayTimetable,
        schedule
    );

    const displayChanges =
        scheduleType === "test"
            ? {}
            : changes;


    renderClassList(
        status,
        todayTimetable,
        schedule,
        displayChanges
    );


    // ========================================
    // 教室・備考変更を画面へ反映
    // ========================================

    applyTodayDetails(
        todayTimetable,
        changes
    );


    // ========================================
    // 今日の変更欄
    // ========================================

    const section =
        document.getElementById(
            "changes-section"
        );
    
    const list =
        document.getElementById(
            "changes-list"
        );
    
    if (section) {
        section.hidden = true;
    }
    
    if (list) {
        list.innerHTML = "";
    }
}


// 最初の描画
updateToday();


// 30秒ごとに更新
setInterval(
    updateToday,
    10000
);

