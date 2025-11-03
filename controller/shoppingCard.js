window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";
let total = 0;
const user = JSON.parse(window.localStorage.getItem("user")); // Kullanıcı bilgilerini al
const customerId = user ? user.id : null;  // Kullanıcı ID'sini al, yoksa null döndür

async function listele() {
  const cartItemsContainer = document.getElementById("cartItems");
  cartItemsContainer.innerHTML = "";
  total = 0;

  
    const cart = await getShoppingCart();
  


  if (!cart || cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Sepetiniz boş.</p>";
    return;
  }

  cart.forEach(item => {
    item.img = atob(item.img);
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.innerHTML = `
    <div class="card bg-dark text-white mb-3" style="border: none; margin-bottom: 0;">
  <div class="row g-0 align-items-center">
    <div class="col-md-2">
      <img src="${item.img}" class="img-fluid rounded-start" alt="${item.product_name}">
    </div>
    <div class="col-md-8">
      <div class="card-body">
        <h5 class="card-title">${item.product_name}</h5>
        <p class="card-text">Fiyat: ${formatPrice(item.price)}₺</p>
        <input type="number" value="${item.amount}" min="1" max="${item.stock}" class="form-control w-25 d-inline" onchange="guncelleMiktar(${item.product_id}, this.value, ${item.stock}, this)">
      </div>
    </div>
    <div class="col-md-2 text-end pe-3">
      <button class="btn btn-danger" onclick="silUrun(${item.product_id})">
        🗑️
      </button>
    </div>
  </div>
</div>
  `;

    cartItemsContainer.appendChild(card);
    total += item.price * item.amount;
  });

  document.getElementById("total_price").textContent = `${formatPrice(total)}₺`;
}

async function silUrun(productId) {



  try {
    await deleteFromCart(productId, customerId);
    location.reload(); // sayfayı yenileyerek sepeti güncelle
  } catch (err) {
    console.error("Ürün silinemedi:", err);
  }

}

async function guncelleMiktar(productId, amount, stock, inputEl) {
  const miktar = parseInt(amount);

  if (miktar < 1) {
    await deleteFromCart(productId);
    inputEl.closest(".card").remove();
  } else if (miktar > stock) {
    alert("Stok yetersiz!");
    inputEl.value = stock;
  } else {
    await insertShoppingCart(productId, miktar); // miktarı direkt set ediyoruz
    listele();
  }
}

async function al() {
  const cart = await getShoppingCart();

  for (const item of cart) {
    const newStock = item.stock - item.amount;
    await updateProductStock(item.product_id, newStock);
    await deleteFromCart(item.product_id);
  }

  alert("Satın alma işlemi tamamlandı.");
  listele();
  document.getElementById("total_price").textContent = `0 ₺`;
}

async function getShoppingCart() {



  // if (!customerId) {
  //   console.error("Geçerli bir kullanıcı ID'si bulunamadı.");
  //   return [];
  // }

  try {
    const res = await fetch(`${API_BASE_URL}/cart?customerId=${customerId}`);  // customerId'yi query string olarak ekle
    return await res.json();
  } catch (err) {
    console.error("Sepet alınamadı:", err);
    return [];
  }
}


async function insertShoppingCart(productId, quantity) {
  try {
    await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, customerId }) // <-- Eksik olan buydu
    });
  } catch (err) {
    console.error("Sepet güncellenemedi:", err);
  }
}


async function deleteFromCart(productId) {
  try {
    await fetch(`${API_BASE_URL}/cart/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, customerId }) // <-- Eksik olan
    });
  } catch (err) {
    console.error("Sepetten silinemedi:", err);
  }
}


async function updateProductStock(productId, stock) {
  try {
    await fetch(`${API_BASE_URL}/product/updateStock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, stock })
    });
  } catch (err) {
    console.error("Stok güncellenemedi:", err);
  }
}

function directorMain() {
    window.location.assign('main.html');
}
function formatPrice(value) {
  value = Number(value); // Sayıya çevir
  let parts = value.toFixed(2).split('.'); // Ondalık kısmı sabit tut
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Binlik ayırıcıyı ekle
  return parts.join(','); // Ondalık ayırıcıyı virgülle birleştir
}