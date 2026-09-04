import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

import {
    getAuth,
    GoogleAuthProvider
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCaCPkbi3lmoQcpZqfHVEGf-_k2ghmGLdQ",
    authDomain: "hakuafes-2026-34.firebaseapp.com",
    databaseURL: "https://hakuafes-2026-34-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hakuafes-2026-34",
    storageBucket: "hakuafes-2026-34.firebasestorage.app",
    messagingSenderId: "138331403152",
    appId: "1:138331403152:web:74e7503af8721c3ac43915"
};

export const app =
    initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);

export const googleProvider =
    new GoogleAuthProvider();


export function formatDateKey(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


export async function getDayData(date) {

    const dateKey = formatDateKey(date);

    try {

        const dayRef =
            ref(database, `days/${dateKey}`);

        const snapshot =
            await get(dayRef);

        if (!snapshot.exists()) {
            return null;
        }

        return snapshot.val();

    } catch (error) {

        console.error(
            "日別データ取得エラー:",
            error
        );

        return null;
    }
}

// ========================================
// 日別データ保存
// ========================================

export async function saveDayData(date, data) {

    const dateKey = formatDateKey(date);

    const dayRef =
        ref(database, `days/${dateKey}`);

    await set(dayRef, data);
}