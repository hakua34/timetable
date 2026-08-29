import {
    auth,
    googleProvider
} from "./firebase.js";

import {
    signInWithPopup,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
const loginScreen =
    document.getElementById("login-screen");

const app =
    document.getElementById("app");

const googleLoginButton =
    document.getElementById("google-login");

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
// Googleログイン
// ========================================

googleLoginButton.addEventListener(
    "click",
    async () => {

        try {

            const result =
                await signInWithPopup(
                    auth,
                    googleProvider
                );

            // ★ Safariでもここで即切替
            showApp(result.user);

        } catch (error) {

            console.error(
                "Googleログイン失敗:",
                error
            );

            alert(
`Googleログインに失敗しました

code:
${error.code || "なし"}

message:
${error.message || "なし"}`
            );
        }

    }
);


// ========================================
// 管理者ログイン画面
// ========================================

showAdminLogin.addEventListener(
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


adminCancel.addEventListener(
    "click",
    closeAdminLogin
);

adminBackground.addEventListener(
    "click",
    closeAdminLogin
);


// ========================================
// 管理者ログイン
// ========================================

adminLoginButton.addEventListener(
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


        /*
            見た目上:
            ageishi

            Firebase内部:
            ageishi@timetable.local
        */

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


// Enterでもログイン
adminPassword.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            adminLoginButton.click();
        }

    }
);


// ========================================
// ログイン状態
// ========================================

onAuthStateChanged(
    auth,
    user => {

        console.log(
            "認証状態:",
            user?.email || "未ログイン"
        );

        if (user) {

            showApp(user);

        } else {

            showLogin();
        }

    }
);

logoutButton?.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "ログアウトしますか？"
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

function showApp(user) {

    const editButton =
        document.getElementById("day-edit-button");

    const isAdmin =
        user.email === "ageishi@timetable.local";


    // ログイン画面を完全に消す
    loginScreen.hidden = true;
    loginScreen.style.setProperty(
        "display",
        "none",
        "important"
    );


    // アプリ表示
    app.hidden = false;
    app.style.removeProperty("display");


    // 管理者判定
    if (editButton) {
        editButton.hidden = !isAdmin;
    }


    if (accountEmail) {
        accountEmail.textContent =
            isAdmin
                ? "ageishi"
                : user.email || "Googleユーザー";
    }


    if (accountRole) {
        accountRole.textContent =
            isAdmin
                ? "管理者"
                : "一般ユーザー";
    }


    if (debugSettings) {
        debugSettings.hidden = !isAdmin;
    }


    document.body.dataset.role =
        isAdmin ? "admin" : "user";
}

function showLogin() {

    loginScreen.hidden = false;

    loginScreen.style.setProperty(
        "display",
        "flex",
        "important"
    );

    app.hidden = true;
    app.style.setProperty(
        "display",
        "none",
        "important"
    );

    delete document.body.dataset.role;
}


// ========================================
// 他ファイルからログアウト用
// ========================================

export async function logout() {

    await signOut(auth);

}
