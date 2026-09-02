// ========================================
// 日付・時刻
// ========================================
import { updateToday } from "./today.js";
import { renderWeekly } from "./weekly.js";
import "./calendar.js";
import "./auth.js";
import {
    setupNotifications
} from "./notifications.js";
const dateElement = document.getElementById("header-date");
const weekdayElement = document.getElementById("header-weekday");
const timeElement = document.getElementById("header-time");

const weekdays = [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日"
];

function updateClock() {

    const now = new Date();

    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekday = weekdays[now.getDay()];

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    dateElement.textContent = `${month}月${date}日`;
    weekdayElement.textContent = weekday;

    timeElement.textContent = `${hour}:${minute}`;
}

updateClock();

// 秒が変わるたびに更新
setInterval(updateClock, 1000);


// ========================================
// 下部ナビゲーション
// ========================================

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const pageName = item.dataset.page;

        // ナビの選択状態を解除
        navItems.forEach(nav => {
            nav.classList.remove("active");
        });

        // 押されたものを選択
        item.classList.add("active");


        // 全ページ非表示
        pages.forEach(page => {
            page.classList.remove("active");
        });


        // 対象ページ表示
        const targetPage =
            document.getElementById(`page-${pageName}`);

        if (targetPage) {
            targetPage.classList.add("active");
        }


        // ページ上部へ
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});

const notificationButton =
    document.getElementById(
        "notification-button"
    );

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        async () => {

            await setupNotifications();

        }
    );

}