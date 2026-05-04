fetch('http://127.0.0.1:5000/api/branches')
  .then(res => res.text())
  .then(data => console.log('RESPONSE:', data))
  .catch(err => console.error('ERROR:', err.message));
