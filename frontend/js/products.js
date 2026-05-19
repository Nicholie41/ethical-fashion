async function loadProducts() {
  const search = document.getElementById('search').value;
  const minScore = document.getElementById('minScore').value;
  const material = document.getElementById('material').value;
  let params = [];
  if (search) params.push('search=' + encodeURIComponent(search));
  if (minScore) params.push('minScore=' + encodeURIComponent(minScore));
  if (material) params.push('material=' + encodeURIComponent(material));
  let url = '/products';
  if (params.length) url += '?' + params.join('&');
  const products = await apiRequest(url);
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p => {
    container.innerHTML += `
      <div class="bg-white p-4 rounded shadow">
        <img src="${p.imageUrl || ''}" alt="${p.name}" class="w-full h-40 object-cover rounded">
        <h2 class="font-bold text-lg mt-2">${p.name}</h2>
        <p>${p.description || ''}</p>
        <p><b>Price:</b> $${p.price}</p>
        <p><b>Sustainability Score:</b> ${p.sustainabilityScore}/10</p>
      </div>
    `;
  });
}
window.onload = loadProducts;