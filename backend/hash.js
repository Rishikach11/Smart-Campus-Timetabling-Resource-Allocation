const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("54321", 10);
  console.log("PASSWORD HASH:");
  console.log(hash);
})();
