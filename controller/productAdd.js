const API_BASE_URL = "http://localhost:3000/api";


// Marka seçeneklerini doldurur
async function selectBrand() {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    const brands = await response.json();
    const brandSelect = document.getElementById('MarkaUrun');
    brandSelect.innerHTML = '<option value="">Seçiniz</option>';

    brands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand.id; // ID olarak value atanıyor
      option.text = brand.brand_name;
      brandSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Marka listeleme hatası:', error);
  }
}

// Kategori seçeneklerini doldurur
async function selectCategory() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const categories = await response.json();
    const categorySelect = document.getElementById('kategori');
    categorySelect.innerHTML = '<option value="">Seçiniz</option>';

    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id; // ID olarak value atanıyor
      option.text = category.category_name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
  }
}

// Görsel önizleme
function addImage() {
  const fileInput = document.getElementById("formFile");
  const imagePreview = document.getElementById("resim");

  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Görsel temizle
function deleteImage() {
  document.getElementById("resim").src = "";
  document.getElementById("formFile").value = "";
}

// Ürün ekleme işlemi
function addProduct() {
  const brandId = document.getElementById("MarkaUrun").value;
  const categoryId = document.getElementById("kategori").value;
  const productName = document.getElementById("urun").value;
  const stock = document.getElementById("miktar").value;
  const price = document.getElementById("fiyat").value;
  const fileInput = document.getElementById("formFile");
  const file = fileInput.files[0];

  if (!brandId || !categoryId || !productName || !stock || !price || !file) {
    alert("Tüm alanları doldurun ve bir görsel seçin.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function () {
    const base64Image = reader.result;

    const productData = {
      brandId: parseInt(brandId),
      modelId: "1", // Eğer ileride model kullanırsan burada dinamik hale getirebiliriz
      // categoryId: parseInt(categoryId),
      categoryId: "1",
      productName,
      stock: parseInt(stock),
      price: parseFloat(price),
      imgPath: base64Image
    };

    fetch(`${API_BASE_URL}/products/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Ürün başarıyla eklendi!");
          location.reload();
        } else {
          alert("Ürün eklenemedi.");
        }
      })
      .catch(err => {
        console.error("Ürün ekleme hatası:", err);
        alert("Sunucu hatası oluştu.");
      });
  };

  reader.readAsDataURL(file);
}

function directorMain() {
    window.location.assign('main.html');
}
