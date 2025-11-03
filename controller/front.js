window.API_BASE_URL = window.API_BASE_URL || "http://localhost:3000/api";


///////////////////////////////////////////////////
// 1. Marka İşlemleri
///////////////////////////////////////////////////

// async function selectBrand() {
//   try {
//     const response = await fetch(`${API_BASE_URL}/brands`);
//     const brands = await response.json();
//     brands.forEach(brand => {
//       MarkaUrun(brand.brand_name);
//       MarkaModel(brand.brand_name);
//     });
//   } catch (error) {
//     console.error('Marka listeleme hatası:', error);
//   }
// }

async function selectIds(brandName) {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    const brands = await response.json();
    const brand = brands.find(b => b.brand_name === brandName);
    return brand?.id;
  } catch (error) {
    console.error('Marka ID alma hatası:', error);
  }
}

///////////////////////////////////////////////////
// 2. Kategori İşlemleri
///////////////////////////////////////////////////

async function selectCategory() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const categories = await response.json();
    categories.forEach(category => {
      addCategoryOption(category.category_name);
    });
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
  }
}

function addCategoryOption(categoryName) {
  const categorySelect = document.getElementById('kategori');
  const option = document.createElement('option');
  option.value = categoryName;
  option.text = categoryName;
  categorySelect.appendChild(option);
}


///////////////////////////////////////////////////
// 2. Ürün İşlemleri
///////////////////////////////////////////////////

async function getAllProduct() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    return await response.json();
  } catch (error) {
    console.error('Ürün listeleme hatası:', error);
  }
}

async function getProductForId(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    return await response.json();
  } catch (error) {
    console.error('Ürün bilgisi alma hatası:', error);
  }
}
async function insertProduct(brandId, modelId, categoryId, productName, stock, price, imgPath) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandId,
        modelId,
        categoryId,
        productName,
        stock,
        price,
        imgPath
      })
    });

    const data = await response.json();
    if (data.success) {
      alert('Ürün başarıyla eklendi!');
    } else {
      alert('Ürün eklerken bir hata oluştu.');
    }
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    alert('Ürün eklerken bir hata oluştu.');
  }
}

///////////////////////////////////////////////////
// 3. Kullanıcı İşlemleri
///////////////////////////////////////////////////

async function insertCustomer(username, password, name, surname, city, state) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, surname, city, state })
    });
    return await response.json();
  } catch (error) {
    console.error('Kayıt hatası:', error);
  }
}

async function customSelect(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
  
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
  
      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
    }
  }

///////////////////////////////////////////////////
// 4. Sepet İşlemleri (JWT doğrulaması olmadan)
///////////////////////////////////////////////////

async function getShoppingCart(customerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cart?customerId=${customerId}`);
    return await response.json();
  } catch (error) {
    console.error('Sepet alma hatası:', error);
  }
}

// Sepete ürün ekle/güncelle
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

// Sepetten ürün sil
async function deleteShop(productId, customerId) {
  await fetch(`${API_BASE_URL}/cart/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, customerId })
  });
}

// Stok güncelle
async function updateProduct(productId, newStock) {
  await fetch(`${API_BASE_URL}/product/updateStock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, stock: newStock })
  });
}