const fetch = require('node-fetch');
(async () => {
  const prodId = 'prod_01J6GHTFCY30P15NKYH2N461B9'; // Let's fetch all reviews without product_id first
  const res = await fetch('http://localhost:9000/store/reviews?product_id=');
  const data = await res.json();
  console.log(data);
})();
