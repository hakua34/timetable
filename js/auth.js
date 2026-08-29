import {
    auth,
    googleProvider
    
} from "./firebase.js";

import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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
// Googleリダイレクト後の処理
// ========================================

getRedirectResult(auth)
    .then(result => {

        if (result?.user) {

            console.log(
                "Googleリダイレクトログイン成功:",
                result.user.email
            );

        }

    })
    .catch(error => {

        console.error(
            "リダイレクトログイン結果取得エラー:",
            error
        );

        alert(
`Googleログイン後の処理に失敗しました

code:
${error.code || "なし"}

message:
${error.message || "なし"}`
        );

    });

// ========================================
// Googleログイン
// ========================================

googleLoginButton.addEventListener(
    "click",
    async () => {

        try {

            const isSafari =
                /^((?!chrome|android).)*safari/i
                    .test(navigator.userAgent);

            const isMobile =
                /iPhone|iPad|iPod|Android/i
                    .test(navigator.userAgent);

            if (isSafari || isMobile) {

                await signInWithRedirect(
                    auth,
                    googleProvider
                );

            } else {

                await signInWithPopup(
                    auth,
                    googleProvider
                );

            }

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

onAuthStateChanged(auth, user => {

    const editButton =
        document.getElementById("day-edit-button");

    if (user) {

        console.log("ログイン:", user.email);

        // ログイン画面を完全に消す
        loginScreen.hidden = true;
        loginScreen.style.display = "none";
        loginScreen.setAttribute("aria-hidden", "true");

        // アプリ本体を表示
        app.hidden = false;
        app.style.display = "block";

        const isAdmin =
            user.email === "ageishi@timetable.local";

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


    } else {

        console.log("未ログイン");

        // ログイン画面表示
        loginScreen.hidden = false;
        loginScreen.style.display = "flex";
        loginScreen.removeAttribute("aria-hidden");

        // アプリ非表示
        app.hidden = true;
        app.style.display = "none";

        if (editButton) {
            editButton.hidden = true;
        }

        if (accountEmail) {
            accountEmail.textContent = "---";
        }

        if (accountRole) {
            accountRole.textContent = "---";
        }

        if (debugSettings) {
            debugSettings.hidden = true;
        }

        delete document.body.dataset.role;
    }

});

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

// ========================================
// 他ファイルからログアウト用
// ========================================

export async function logout() {

    await signOut(auth);

}
