import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const app =
    document.getElementById("app");

const showAdminLogin =
    document.getElementById("show-admin-login");

const adminOverlay =
    document.getElementById("admin-login-overlay");

const adminId =
    document.getElementById("admin-id");

const adminPassword =
    document.getElementById("admin-password");

const adminLoginButton =
    document.getElementById("admin-login-button");

const adminCancel =
    document.getElementById("admin-login-cancel");

const adminBackground =
    document.getElementById("admin-login-background");

const adminLoginError =
    document.getElementById("admin-login-error");

const accountEmail =
    document.getElementById("account-email");

const accountRole =
    document.getElementById("account-role");

const logoutButton =
    document.getElementById("logout-button");

const debugSettings =
    document.getElementById("debug-settings");


// ========================================
// 管理者ログイン画面
// ========================================

showAdminLogin?.addEventListener(
    "click",
    () => {

        adminOverlay.classList.add("show");

        adminLoginError.textContent = "";

        adminId.focus();
    }
);


function closeAdminLogin() {

    adminOverlay.classList.remove("show");

    adminLoginError.textContent = "";

    adminPassword.value = "";
}


adminCancel?.addEventListener(
    "click",
    closeAdminLogin
);


adminBackground?.addEventListener(
    "click",
    closeAdminLogin
);


// ========================================
// 管理者ログイン
// ========================================

adminLoginButton?.addEventListener(
    "click",
    async () => {

        const id =
            adminId.value.trim();

        const password =
            adminPassword.value;


        if (!id || !password) {

            adminLoginError.textContent =
                "IDとパスワードを入力してください";

            return;
        }


        const email =
            `${id}@timetable.local`;


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            closeAdminLogin();

        } catch (error) {

            console.error(
                "管理者ログイン失敗:",
                error
            );

            adminLoginError.textContent =
                "IDまたはパスワードが違います";
        }
    }
);


// ========================================
// Enterでもログイン
// ========================================

adminPassword?.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            adminLoginButton.click();
        }
    }
);


// ========================================
// 認証状態
// ========================================
//
// 一般ユーザー
// → ログイン不要
//
// Firebase Authentication
// → 管理者判定だけに使用
//
// ========================================

onAuthStateChanged(
    auth,
    user => {

        const isAdmin =
            user?.email ===
            "ageishi@timetable.local";

        showApp(isAdmin);
    }
);


// ========================================
// 管理者ログアウト
// ========================================

logoutButton?.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "管理者からログアウトしますか？"
            );

        if (!confirmed) {
            return;
        }


        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "ログアウト失敗:",
                error
            );

            alert(
                "ログアウトに失敗しました"
            );
        }
    }
);


// ========================================
// アプリ表示・権限切り替え
// ========================================

function showApp(isAdmin) {

    const editButton =
        document.getElementById(
            "day-edit-button"
        );


    // アプリ本体は常に表示
    app.hidden = false;

    app.style.removeProperty(
        "display"
    );


    // 編集ボタン
    if (editButton) {

        editButton.hidden =
            !isAdmin;
    }


    // アカウント表示
    if (accountEmail) {

        accountEmail.textContent =
            isAdmin
                ? "ageishi"
                : "ログイン不要";
    }


    // 権限表示
    if (accountRole) {

        accountRole.textContent =
            isAdmin
                ? "管理者"
                : "一般閲覧";
    }


    // 開発者設定
    if (debugSettings) {

        debugSettings.hidden =
            !isAdmin;
    }


    // 管理者ログインボタン
    if (showAdminLogin) {

        showAdminLogin.hidden =
            isAdmin;
    }


    // ログアウトボタン
    if (logoutButton) {

        logoutButton.hidden =
            !isAdmin;
    }


    document.body.dataset.role =
        isAdmin
            ? "admin"
            : "user";
}


// ========================================
// 他ファイルからログアウト用
// ========================================

export async function logout() {

    await signOut(auth);
}
