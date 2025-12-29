const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("admin123", 10);
  console.log("PASSWORD HASH:");
  console.log(hash);
})();
