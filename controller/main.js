// Constants
window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";
const USER_KEY = 'user';
const PRODUCT_KEY = 'product';

// DOM Elements
var elements = {
  kayıt: document.getElementById("kayıt"),
  giris: document.getElementById("giris"),
  cikis: document.getElementById("cikis"),
  add: document.getElementById("add"),
  kategori: document.getElementById("kategori"),
  shoppingCard: document.getElementById("shoppingCard")
};

// Navigation Functions
const navigateTo = {
  login: () => window.location.href = '/login',
  signin: () => window.location.href = '/signin',
  shoppingCard: () => window.location.href = '/shoppingCard',
  category: () => window.location.href = '/category',
  productAdd: () => window.location.href = '/productAdd',
  product: () => window.location.href = '/product'
};

// User Management
function handleUserSession() {
  const user = JSON.parse(localStorage.getItem(USER_KEY));

  if (user) {
    elements.kayıt.style.visibility = "hidden";
    elements.giris.innerText = user.username;
    elements.cikis.style.visibility = "visible";

    if (user.id === 0) {
      elements.add.style.visibility = "visible";
    }

    startSessionTimer();
  }
  if (!user) {
    elements.cikis.style.visibility = "hidden";
    elements.add.style.visibility = "hidden";
    elements.shoppingCard.style.visibility = 'hidden';
    // elements.shoppingCard.style.visibility = "hidden";  

  }
}

function logout() {
  localStorage.removeItem(USER_KEY);
  elements.kayıt.style.visibility = "visible";
  elements.cikis.style.visibility = "hidden";
  elements.shoppingCard.style.visibility = "hidden";
  elements.giris.innerText = "Giriş";
  elements.add.style.visibility = "hidden";
}

function startSessionTimer() {
  setTimeout(logout, 3600000); // 1 hour timeout
}

// Product Functions
async function populateProductList() {
  try {
    const [products, brands] = await Promise.all([getAllProducts(), getAllBrands()]);
    const productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = ''; // Önce içeriği temizle

    // Markaları bir objeye dönüştürüyoruz (brand_id -> brand_name)
    const brandMap = brands.reduce((acc, brand) => {
      acc[brand.id] = brand.brand_name;
      return acc;
    }, {});

    let currentRow;

    products.forEach((product, index) => {
      // Her 6 üründe bir yeni row oluştur
      if (index % 6 === 0) {
        currentRow = document.createElement('div');
        currentRow.className = 'row';
        productContainer.appendChild(currentRow);
      }

      const colDiv = document.createElement('div');
      colDiv.className = 'col-sm-2 mb-4';

      const cardDiv = document.createElement('div');
      cardDiv.className = 'card h-100';

      // Ürün resmi base64 string olarak geliyor
      product.img = atob(product.img);
      // var imageUrl = "data:image/jpeg;base64,${product.img}";
      // product.img= product.img.slice(1, -1);
      const brandName = brandMap[product.brand_id] || 'Bilinmeyen Marka';
      
      cardDiv.innerHTML = `
  <div class="card h-100 d-flex flex-column bg-dark" >
    <img src="${product.img}" class="card-img-top w-100" alt="${product.product_name}" style="height: 180px; object-fit: cover;">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title" style="color: aliceblue;">${brandName}</h5>
      <p class="card-text flex-grow-1" onclick="goToProduct(this)" style="cursor: pointer; color: aliceblue;">
        ${product.product_name} ${formatPrice(product.price)}₺
      </p>
      <a href="#" class="btn btn-primary mt-auto" onclick='ekleSepet(${JSON.stringify(product).replace(/'/g, "\\'")})'>
        Sepete Ekle
      </a>
    </div>
  </div>
`;



      colDiv.appendChild(cardDiv);
      currentRow.appendChild(colDiv);
    });
  } catch (error) {
    console.error("Ürün listesi yüklenirken hata:", error);
    // Hata durumunda kullanıcıya bilgi verebilirsiniz
    const productContainer = document.getElementById("productContainer");
    productContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.
      </div>
    `;
  }
}

// Helper function to get all brands
async function getAllBrands() {
  const response = await fetch(`${API_BASE_URL}/brands`);
  return await response.json();
}

async function goToProduct(event) {
  const productText = event.textContent;
  // const productName = productText.substring(0, productText.lastIndexOf(' '));
  // const brandName = event.parentElement.children[0].textContent;

  try {
    const product = await getProductByName(productName);

    const productData = {
      ...product,
      brand: brandName
    };

    localStorage.setItem(PRODUCT_KEY, JSON.stringify(productData));
    window.location.href = '/product';
  } catch (error) {
    window.location.href = '/product';
    console.error("Ürün detayına giderken hata:", error);
  }
}

async function addToCart(product) {
  try {
    localStorage.setItem("product", JSON.stringify(product));

    if (product.stock <= 0) {
      alert("Ürün stokta tükendi!");
      return;
    }

    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) {
      navigateTo.login();
      return;
    }

    // const customerId = await getCustomerId(user.username);
    // const existingCartItem = await getCartItem(customerId, product.id);

    // if (existingCartItem) {
    //   await updateCartItem(existingCartItem.id, existingCartItem.amount + 1);
    // } else {
    //   await addCartItem(product.id, 1, customerId);
    // }
    navigateTo.product()
    // alert("Ürün sepete eklendi!");
  } catch (error) {
    console.error("Sepete eklerken hata:", error);
    alert("Sepete eklerken bir hata oluştu!");
  }
}

// API Functions
async function getAllProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Ürünler alınamadı');
  return await response.json();
}

async function getProductByName(name) {
  const response = await fetch(`${API_BASE_URL}/products/by-name/${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('Ürün bilgisi alınamadı');
  return await response.json();
}

async function getCustomerId(username) {
  const response = await fetch(`${API_BASE_URL}/customers/by-username/${encodeURIComponent(username)}`);
  if (!response.ok) throw new Error('Müşteri bilgisi alınamadı');
  const data = await response.json();
  return data.id;
}

async function getCartItem(customerId, productId) {
  const response = await fetch(`${API_BASE_URL}/cart?customerId=${customerId}&productId=${productId}`);
  if (!response.ok) throw new Error('Sepet bilgisi alınamadı');
  return await response.json();
}

async function addCartItem(productId, amount, customerId) {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, amount, customerId })
  });
  if (!response.ok) throw new Error('Sepete ekleme başarısız');
}

async function updateCartItem(cartItemId, amount) {
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount })
  });
  if (!response.ok) throw new Error('Sepet güncelleme başarısız');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  elements = {
    kayıt: document.getElementById("kayıt"),
    giris: document.getElementById("giris"),
    cikis: document.getElementById("cikis"),
    add: document.getElementById("add"),
    kategori: document.getElementById("kategori"),
    shoppingCard: document.getElementById("shoppingCard")
  };

  handleUserSession();
  populateProductList();


  const hoverSound = new Audio('media/keyboard-click-327728.mp3'); // Doğru yol

    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(err => {
          console.warn("Ses çalınamadı:", err);
        });
      });
    });
});

// Global Fonksiyonlar


window.directorLogin = navigateTo.login;
window.directorSignin = navigateTo.signin;
window.signin = navigateTo.signin;
window.directorShoppingCard = navigateTo.shoppingCard;
window.directorCategoryScreen = navigateTo.category;
window.directorProductAdd = navigateTo.productAdd;
// window.directorProduct = navigateTo.product;
window.mainCustomer = handleUserSession;
window.cikis = logout;
window.girdi = handleUserSession;
window.categoryAdd = addCategoryOption;
window.listToProduct = populateProductList;
window.goToProduct = goToProduct;
window.ekleSepet = addToCart;
window.timeLook = startSessionTimer;

// Helper function for adding category options
function addCategoryOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.text = value;
  elements.kategori.add(option);
}

let searchTimeout;

function searchLive() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('searchResults');

    if (!query) {
      resultsContainer.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const products = await response.json();

      resultsContainer.innerHTML = '';

      if (products.length === 0) {
        resultsContainer.innerHTML = '<a class="list-group-item list-group-item-action disabled">Sonuç bulunamadı.</a>';
        return;
      }

      products.forEach(product => {
        const item = document.createElement('a');
        item.className = 'list-group-item list-group-item-action d-flex align-items-center gap-2';
        item.href = '#'; // Sayfa yenilenmesin

        // Görsel
        const img = document.createElement('img');
        product.img = atob(product.img);
        img.src = product.img;
        img.alt = product.product_name;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '5px';

        // Metin
        const text = document.createElement('span');
        text.textContent = `${product.product_name} - ${product.brand_name}`;

        // Tümünü birleştir
        item.appendChild(img);
        item.appendChild(text);

        // Tıklanınca detaylara yönlendir
        item.addEventListener('click', () => handleSearchClick(product));

        resultsContainer.appendChild(item);
      });
    } catch (error) {
      console.error("Arama hatası:", error);
      resultsContainer.innerHTML = '<a class="list-group-item list-group-item-action disabled">Arama sırasında hata oluştu.</a>';
    }
  }, 300);
}


async function handleSearch(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem(USER_KEY));
  if (!user) {
    navigateTo.login();
    return;
  }
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return;

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const products = await response.json();

    if (products.length === 0) {
      alert("Sonuç bulunamadı.");
      return;
    }

    const firstProduct = products[0]; // İlk sonucu al
    firstProduct.img = atob(firstProduct.img);
    localStorage.setItem("product", JSON.stringify(firstProduct)); // Ürünü kaydet
    window.location.href = "product.html"; // Ürün detay sayfasına git
  } catch (error) {
    console.error("Arama yönlendirme hatası:", error);
    alert("Ürün detayına erişilirken bir hata oluştu!");
  }
}


function handleSearchClick(product) {
  try {
    // Ürünü localStorage’a kaydet (eskiyi silip yenisiyle günceller)
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) {
      navigateTo.login();
      return;
    }
    localStorage.setItem("product", JSON.stringify(product));

    // Ürün detay sayfasına yönlendir
    window.location.href = "product.html";
  } catch (error) {
    console.error("Ürün detayına giderken hata:", error);
    alert("Ürün bilgisine erişilirken bir hata oluştu!");
  }
}
function formatPrice(value) {
  value = Number(value); // Sayıya çevir
  let parts = value.toFixed(2).split('.'); // Ondalık kısmı sabit tut
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Binlik ayırıcıyı ekle
  return parts.join(','); // Ondalık ayırıcıyı virgülle birleştir
}

const hoverSound = new Audio('media/keyboard-click-327728.mp3');

 document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', () => {
      hoverSound.currentTime = 0; // Her seferinde baştan çalsın
      hoverSound.play();
    });
  });
  