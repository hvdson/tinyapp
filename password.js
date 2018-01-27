const database = require("./database.js");
const bcrypt = require('bcrypt');

// console.log(database.urlDatabase);

for (let obj in database.users){
  const password = database.users[obj].password;

  const hashedPassword = bcrypt.hashSync(password, 10);

  console.log(`password for: ${database.users[obj].id}`);
  console.log(`password: ${password}`);
  console.log(`hashedPassword: ${hashedPassword}`);
  console.log(bcrypt.compareSync(password, hashedPassword));

}