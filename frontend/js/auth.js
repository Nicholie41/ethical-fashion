document.getElementById('loginForm').onsubmit = async function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const result = await apiRequest('/auth/login', 'POST', { username, password });
  if (result.token) {
    localStorage.setItem('token', result.token);
    window.location.href = 'products.html';
  } else {
    document.getElementById('error').innerText = result.error || 'Login failed';
  }
}