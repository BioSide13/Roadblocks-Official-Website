// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCQ60VzI6HZqD1Xqf3ktbHZLVCQ4-50yd4",
    authDomain: "roadblocks-51160.firebaseapp.com",
    databaseURL: "https://roadblocks-51160-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "roadblocks-51160",
    storageBucket: "roadblocks-51160.firebasestorage.app",
    messagingSenderId: "243980551551",
    appId: "1:243980551551:web:b3e7db1cc277931e37064a",
    measurementId: "G-N8E1ETFY9R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
