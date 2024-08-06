import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getStorage, ref as storageRef, listAll, getDownloadURL, uploadBytesResumable,deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getDatabase, ref as databaseRef, onValue, set, get,remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import firebaseConfig from './auth.js';

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
document.getElementById('deletebtn').addEventListener('click', () => {
    showDeleteButtons = !showDeleteButtons;
    displayProducts(allProducts);
});
let allProducts = {}; // Store all products data
let showDeleteButtons = false;
function fetchData() {
    var ref = databaseRef(database, "Store");
    onValue(ref, (snapshot) => {
        allProducts = snapshot.val();
        displayProducts(allProducts);
    }, (error) => {
        console.error('Error fetching data:', error);
    });
}

function displayProducts(products) {
    const mainContainer = document.querySelector('.main');
    mainContainer.innerHTML = ''; // Clear any existing content
    mainContainer.style.display = 'flex';
    mainContainer.style.flexWrap = 'wrap';
    mainContainer.style.justifyContent = 'space-between';

    for (const key in products) {
        if (products.hasOwnProperty(key)) {
            const productList = products[key];
            for (const subkey in productList) {
                if (productList.hasOwnProperty(subkey)) {
                    const product = productList[subkey];
                    const productDiv = document.createElement('div');
                    productDiv.className = 'product p-4 m-4 border rounded shadow';
                    productDiv.style.flex = 'calc(30%)';

                    const productImage = document.createElement('img');
                    productImage.src = product.URL;
                    productImage.alt = product.name;
                    productImage.className = 'w-full h-48 object-cover mb-4';

                    const productName = document.createElement('h2');
                    productName.textContent = subkey;
                    productName.className = 'text-lg font-bold mb-2';

                    const productPrice = document.createElement('p');
                    productPrice.textContent = `ราคา: ${product.price}`;
                    productPrice.className = 'text-gray-600';
                    productDiv.appendChild(productImage);
                    productDiv.appendChild(productName);
                    productDiv.appendChild(productPrice);
                    mainContainer.appendChild(productDiv);
                    if (showDeleteButtons) {
                        const deleteButton = document.createElement('button');
                        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
                        deleteButton.className = 'delete-btn text-red-500 hover:text-red-700';
                        deleteButton.onclick = () => deleteProduct(key, subkey, product.URL);

                        productDiv.appendChild(deleteButton);
                    }

                    
                }
            }
        }
    }
}
function deleteProduct(category, productId, imageUrl) {
    if (confirm("จะทำการลบสินค้าแน่ใจนะ!!")) {
        const productRef = databaseRef(database, `Store/${category}/${productId}`);
        remove(productRef).then(() => {
            console.log(productId)
            const imageRef = storageRef(storage, "images/"+productId);
            console.log(imageRef)
            deleteObject(imageRef).then(() => {
                alert('ทำการลบเสร็จสิ้น');
                //fetchData(); // Refresh the product list after deletion
            }).catch((error) => {
                console.error('Error deleting image:', error);
            });
        }).catch((error) => {
            console.error('Error deleting product:', error);
        });
    }
}

function filterProducts(query) {
    const filteredProducts = {};
    for (const key in allProducts) {
        if (allProducts.hasOwnProperty(key)) {
            const productList = allProducts[key];
            for (const subkey in productList) {
                if (productList.hasOwnProperty(subkey)) {
                    const product = productList[subkey];
                    if (subkey.includes(query) || subkey.includes(query)) {
                        if (!filteredProducts[key]) {
                            filteredProducts[key] = {};
                        }
                        filteredProducts[key][subkey] = product;
                    }
                }
            }
        }
    }
    displayProducts(filteredProducts);
}

document.getElementById('search-bar').addEventListener('input', (event) => {
    const query = event.target.value;
    filterProducts(query);
});

window.onload = fetchData;
