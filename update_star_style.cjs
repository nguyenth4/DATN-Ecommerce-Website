const fs = require('fs');

const filePath = 'd:/FPT Polytechnic/DATN/DATN-Ecommerce-Website/src/client/pages/AccountPage.tsx';
let file = fs.readFileSync(filePath, 'utf8');

// Replace Star components in form input
file = file.replace(
  `fill={star <= rs.rating ? "#ffc107" : "#e2e8f0"} \n                                                        color={star <= rs.rating ? "#ffc107" : "#cbd5e1"}`,
  `fill={star <= rs.rating ? "#ffb800" : "transparent"}\n                                                        color="#ffb800"`
);

// If single line
file = file.replace(
  `fill={star <= rs.rating ? "#ffc107" : "#e2e8f0"} color={star <= rs.rating ? "#ffc107" : "#cbd5e1"}`,
  `fill={star <= rs.rating ? "#ffb800" : "transparent"} color="#ffb800"`
);

const regexStar = /fill=\{star <= rs\.rating \? "#ffc107" : "#e2e8f0"\}\s*color=\{star <= rs\.rating \? "#ffc107" : "#cbd5e1"\}/g;
file = file.replace(regexStar, 'fill={star <= rs.rating ? "#ffb800" : "transparent"} color="#ffb800"');

// Replace bi-star icons in saved view if any
file = file.replace(
  `s <= rs.rating ? "bi-star-fill" : "bi-star"`,
  `s <= rs.rating ? "bi-star-fill" : "bi-star"`
);

fs.writeFileSync(filePath, file, 'utf8');
console.log('Star style updated!');
