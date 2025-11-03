var inputControl;

async function signin() {
    controlInput(); // Form boş mu?

    if (!inputControl) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    const isPasswordValid = passwordControl();
    if (!isPasswordValid) {
        alert("Şifreler uyuşmuyor");
        document.getElementById("Password1").value = "";
        document.getElementById("Password2").value = "";
        return;
    }

    // Formdan verileri al
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var userName = document.getElementById("username").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    var password = document.getElementById("Password1").value;

    try {
        // Kayıt işlemi
        const res = await insertCustomer(userName, password, name, surname, city, state);

        if (res?.error) {
            alert("Kullanıcı adı daha önce alınmış!");
            document.getElementById("username").value = "";
            document.getElementById("Password1").value = "";
            document.getElementById("Password2").value = "";
            return;
        }

        alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        directorLogin();

    } catch (error) {
        console.error('Kayıt işlemi hatası:', error);
        alert('Bir hata oluştu, lütfen tekrar deneyin.');
    }
}

// Şifreler aynı mı?
function passwordControl() {
    var p1 = document.getElementById("Password1").value;
    var p2 = document.getElementById("Password2").value;
    return p1 === p2;
}

// Tüm inputlar dolu mu?
function controlInput() {
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var username = document.getElementById("username").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    var password1 = document.getElementById("Password1").value;
    var password2 = document.getElementById("Password2").value;

    inputControl = name && surname && username && city && state && password1 && password2;
}

// Başarılı kayıt sonrası yönlendirme
function directorLogin() {
    window.location.assign('login.html');
}
function directorMain() {
    window.location.assign('main.html');
}

// Görünüm güncelleme (gerekiyorsa)
function gizleGoster() {
    var secilenID = document.getElementById("someID"); // ID doğru olmalı
    secilenID.style.display = secilenID.style.display === "none" ? "" : "none";
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