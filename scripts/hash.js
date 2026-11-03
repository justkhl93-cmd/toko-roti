const bcrypt = require("bcryptjs");

const password = process.argv[2];
if (!password) {
  console.log("Cara pakai: node scripts/hash.js passwordkamu");
  process.exit();
}

console.log(bcrypt.hashSync(password, 10));