import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getStorage, ref as storageRef, listAll, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getDatabase, ref as databaseRef, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import firebaseConfig from './auth.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

var name, price, type,imgurl;
const nameRT = document.getElementById('name'); //realtime database
const priceRT = document.getElementById('price'); //realtime database

// Get images
document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('capturedImage');
            img.src = e.target.result;
            img.style.display = 'block';
            console.log(img.src);
        };
        reader.readAsDataURL(file);
    }
});

// Get select
document.getElementById('name').addEventListener('change', function(event) {
    name = event.target.value;
    console.log(name);
});

document.getElementById('price').addEventListener('change', function(event) {
    price = event.target.value;
    console.log(price);
});

document.getElementById('type').addEventListener('change', function(event) {
    type = event.target.value;
    console.log(type);
});

// Upload image to Firebase Storage
document.getElementById('uploadButton').addEventListener('click', function() {
    const file = document.getElementById('imageInput').files[0];
    if (file && name && type) {
        const imageRef = storageRef(storage, 'images/' + name);
        const uploadTask = uploadBytesResumable(imageRef, file);

        uploadTask.on('state_changed',
            function(snapshot) {
                // Observe state change events such as progress, pause, and resume
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, 
            function(error) {
                // Handle unsuccessful uploads
                console.error('Upload failed:', error);
            }, 
            function() {
                // Handle successful uploads on complete
                getDownloadURL(uploadTask.snapshot.ref).then(function(downloadURL) {
                    console.log('File available at', downloadURL);
                    imgurl= downloadURL;
                    setToRDB();
                    alert('เพิ่มสินค้าเสร็จสิ้น');
                });
            }
        );
    } else {
        if (!file) {
            alert('ใส่รูปด้วย');
        }
        if (!name) {
            alert('ใส่ชื่อสินค้าด้วย');
        }
        if (!type) {
            alert('เลือกประเภทสินค้าด้วย');
        }
    }
});

// Set to Realtime Database
function setToRDB() {
    set(databaseRef(database, 'Store/'+type + '/' + name), { "price": price, "URL": imgurl });
}
