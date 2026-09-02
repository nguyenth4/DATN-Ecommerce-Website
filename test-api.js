fetch("http://localhost:9000/store/orders?limit=50&expand=items,shipping_address", {
  headers: {
    "x-publishable-api-key": "pk_a2f0825ab169a70b98f5a520693ca5e8e633f36c1b5dabd5548326c5451c4e6d"
  }
}).then(res => res.json()).then(console.log).catch(console.error);
