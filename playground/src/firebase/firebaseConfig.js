// Firebase config to use (include exactly)
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyD8R-DcFmQWzslBQCAy_Enz1irylydLp9E",
    authDomain: "multi-ai-playground.firebaseapp.com",
    projectId: "multi-ai-playground",
    storageBucket: "multi-ai-playground.firebasestorage.app",
    messagingSenderId: "1017579317105",
    appId: "1:1017579317105:web:2bd60246c876aca73a38d0",
    measurementId: "G-7ZCFZFXYNX"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
void analytics;


