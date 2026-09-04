// ========================================
// Firebase
// ========================================

importScripts(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js"
);


firebase.initializeApp({

    apiKey:
        "AIzaSyCaCPkbi3lmoQcpZqfHVEGf-_k2ghmGLdQ",

    authDomain:
        "hakuafes-2026-34.firebaseapp.com",

    databaseURL:
        "https://hakuafes-2026-34-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "hakuafes-2026-34",

    storageBucket:
        "hakuafes-2026-34.firebasestorage.app",

    messagingSenderId:
        "138331403152",

    appId:
        "1:138331403152:web:74e7503af8721c3ac43915"

});


const messaging =
    firebase.messaging();


// ========================================
// Service Worker
// ========================================

self.addEventListener(
    "install",
    () => {

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(
            self.clients.claim()
        );

    }
);