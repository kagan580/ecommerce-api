async function directorSignin() {
    window.location.assign('signin.html');
}

async function directorMain() {
    window.location.assign('main.html');
}

async function loginControl(_username, _password) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: _username, password: _password }),
        });

        const data = await response.json();

        if (data.success) {
            // Sadece kullanıcı bilgilerini saklıyoruz
            localStorage.setItem('user', JSON.stringify(data.user));
            loginPage();
        } else {
            alert(data.error || 'Giriş başarısız, lütfen tekrar deneyin.');
        }
    } catch (error) {
        console.error('Giriş sırasında bir hata oluştu:', error);
        alert('Giriş sırasında bir hata oluştu, lütfen tekrar deneyin.');
    }
}

function customerLogin() {
    const uname = document.getElementById("exampleInputusername1").value;
    const pswrd = document.getElementById("exampleInputPassword1").value;

    loginControl(uname, pswrd);
}

function loginPage() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        directorMain();
    } else {
        alert('Kullanıcı bilgileri bulunamadı, giriş yapınız.');
    }
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