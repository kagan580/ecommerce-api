window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";


function productLoad() {
    var object = JSON.parse(window.localStorage.getItem("product"));
    document.getElementById("resim").src = object.img;  
    document.getElementById("aciklama").textContent = object.brand_name + " " + object.product_name;
    document.getElementById("aciklama").style="color: aliceblue;";
    document.getElementById("fiyat").textContent = formatPrice(object.price) + "₺";
    document.getElementById("fiyat").style="color: aliceblue;";
    
}
async function insertShoppingCart(productId, quantity, customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, customerId })
      });
      return await response.json();
    } catch (error) {
      console.error('Sepet ekleme hatası:', error);
    }
  }
  
async function sepeteEkle(thiss) {
    var product = JSON.parse(window.localStorage.getItem("product"));
    var user = JSON.parse(window.localStorage.getItem("user"));
    var productId = product.id;
    var miktar = parseInt(document.getElementById("amount").value);
  
    if (miktar < product.stock) {
      const result = await insertShoppingCart(product.id, miktar, user.id);
      if (result.success) {
        alert("Ürün sepete eklendi!");
      } else {
        alert("Sepete eklenemedi!");
      }
    } else {
      alert("Stokta bu kadar ürün yok");
    }
  }
  


function directorLogin() {
    window.location.assign('login.html');
}
function directorMain() {
    window.location.assign('main.html');
}

function directorSignin() {
    window.location.assign('signin.html');
}
function directorProductAdd() {
    window.location.assign('productAdd.html');
}



function formatPrice(value) {
  value = Number(value); // Sayıya çevir
  let parts = value.toFixed(2).split('.'); // Ondalık kısmı sabit tut
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Binlik ayırıcıyı ekle
  return parts.join(','); // Ondalık ayırıcıyı virgülle birleştir
}

// x.parentElement.parentElement.parentElement.parentElement.parentElement.children[1].children[0].children[1].children[0].textContent