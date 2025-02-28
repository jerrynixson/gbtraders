const bcrypt = require("bcrypt");
const password = "abel1234"; // Your actual password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log("🔑 Hashed Password:", hash);
});