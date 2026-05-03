const data = { name: 'Test User', email: 'test@example.com', password: 'password123' };

fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
  .then(async (res) => {
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text);
  })
  .catch((err) => {
    console.error('fetch error', err);
  });