import {
    subjects,
    timetable,
    specialTimetables
} from "./config.js";

const weeklyBody =
    document.getElementById("weekly-body");

const overlay =
    document.getElementById("subject-overlay");

const subjectTitle =
    document.getElementById("subject-title");

const subjectPeriod =
    document.getElementById("subject-period");

const subjectRoom =
    document.getElementById("subject-room");

const subjectNote =
    document.getElementById("subject-note");

const subjectRoomRow =
    document.getElementById("subject-room-row");

const subjectNoteRow =
    document.getElementById("subject-note-row");

const closeButton =
    document.getElementById("subject-close");


const weekdays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
];

const weekdayNames = {
    monday: "月曜日",
    tuesday: "火曜日",
    wednesday: "水曜日",
    thursday: "木曜日",
    friday: "金曜日"
};


// ========================================
// 週間時間割生成
// ========================================

export function renderWeekly() {

    weeklyBody.innerHTML = "";

    for (let period = 0; period < 6; period++) {

        const tr =
            document.createElement("tr");


        // 時限
        const periodCell =
            document.createElement("th");

        periodCell.className =
            "weekly-period";

        periodCell.textContent =
            `${period + 1}`;

        tr.appendChild(periodCell);


        // 月〜金
        weekdays.forEach(day => {

            const td =
                document.createElement("td");

            td.dataset.weekday = day;


            const subjectId =
                timetable[day][period];


            if (subjectId) {

                const subject =
                    subjects[subjectId];

                const button =
                    document.createElement("button");

                button.className =
                    "weekly-subject";

                button.textContent =
                    subject.name;

                button.addEventListener(
                    "click",
                    () => {
                        openSubject(
                            subjectId,
                            day,
                            period
                        );
                    }
                );

                td.appendChild(button);

            } else {

                td.classList.add("empty");

                td.textContent = "—";

            }


            tr.appendChild(td);

        });
// カセット列
const cassetteCell =
    document.createElement("td");

const cassetteSubjectId =
    specialTimetables.cassette.subjects[period];

if (cassetteSubjectId) {

    const subject =
        subjects[cassetteSubjectId];

    const button =
        document.createElement("button");

    button.className =
        "weekly-subject";

    button.textContent =
        subject.name;

    button.addEventListener(
        "click",
        () => {

            subjectPeriod.textContent =
                `カセット日程・${period + 1}限`;

            subjectTitle.textContent =
                subject.name;

            if (subject.room) {
                subjectRoomRow.style.display = "flex";
                subjectRoom.textContent = subject.room;
            } else {
                subjectRoomRow.style.display = "none";
            }

            if (subject.note) {
                subjectNoteRow.style.display = "flex";
                subjectNote.textContent = subject.note;
            } else {
                subjectNoteRow.style.display = "none";
            }

            overlay.classList.add("show");

            document.body.classList.add(
                "overlay-open"
            );
        }
    );

    cassetteCell.appendChild(button);

        } else {

            cassetteCell.classList.add("empty");
            cassetteCell.textContent = "—";

        }

        tr.appendChild(cassetteCell);

        weeklyBody.appendChild(tr);

    }


    highlightToday();

}


// ========================================
// 今日の列
// ========================================

function highlightToday() {

    const dayNumber =
        new Date().getDay();

    const map = {
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday"
    };

    const today =
        map[dayNumber];

    if (!today) {
        return;
    }


    document
        .querySelectorAll(
            `[data-weekday="${today}"]`
        )
        .forEach(element => {

            element.classList.add(
                "today-column"
            );

        });

}


// ========================================
// 教科詳細
// ========================================

function openSubject(
    subjectId,
    day,
    period
) {

    const subject =
        subjects[subjectId];


    subjectPeriod.textContent =
        `${weekdayNames[day]}・${period + 1}限`;

    subjectTitle.textContent =
        subject.name;


    // 教室
    if (subject.room) {

        subjectRoomRow.style.display =
            "flex";

        subjectRoom.textContent =
            subject.room;

    } else {

        subjectRoomRow.style.display =
            "none";

    }


    // 備考
    if (subject.note) {

        subjectNoteRow.style.display =
            "flex";

        subjectNote.textContent =
            subject.note;

    } else {

        subjectNoteRow.style.display =
            "none";

    }


    overlay.classList.add("show");

    document.body.classList.add(
        "overlay-open"
    );

}


// ========================================
// 閉じる
// ========================================

function closeSubject() {

    overlay.classList.remove("show");

    document.body.classList.remove(
        "overlay-open"
    );

}


closeButton.addEventListener(
    "click",
    closeSubject
);


document
    .querySelectorAll(
        "[data-close-overlay]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            closeSubject
        );

    });


// ESC
document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeSubject();
        }

    }
);



// 最初に生成
renderWeekly();