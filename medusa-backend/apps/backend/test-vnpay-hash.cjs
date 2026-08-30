const crypto = require('crypto');
const qs = require('qs');

function buildVNPayUrl() {
  const hashSecret = "OOUZ520Y0L18FY4C3H4B7N1D2T6I1N11"; // random fake
  const tmnCode = "D1A3C4D5";
  const amount = 50000;
  
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const vnpCreateDate =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: (amount * 100).toString(),
    vnp_CreateDate: vnpCreateDate,
    vnp_CurrCode: "VND",
    vnp_IpAddr: "127.0.0.1",
    vnp_Locale: "vn",
    vnp_OrderInfo: "test order",
    vnp_OrderType: "other",
    vnp_ReturnUrl: "http://localhost",
    vnp_TxnRef: "12345",
  };

  // The problematic code:
  const sortedKeys = Object.keys(params).sort();
  const signData1 = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`).join("&");
  
  // The correct code:
  function sortObject(obj) {
      let sorted = {};
      let str = [];
      let key;
      for (key in obj){
          if (obj.hasOwnProperty(key)) {
          str.push(encodeURIComponent(key));
          }
      }
      str.sort();
      for (key = 0; key < str.length; key++) {
          sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
      }
      return sorted;
  }
  
  const sorted = sortObject(params);
  const signData2 = qs.stringify(sorted, { encode: false });
  
  console.log("signData1: ", signData1);
  console.log("signData2: ", signData2);
  console.log("Match: ", signData1 === signData2);
}
buildVNPayUrl();
