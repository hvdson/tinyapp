// const urlDatabase = {
//   "userRandomID": {
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com"
  

//   "user2RandomID": {
//     "asd123": "http://www.reddit.com",
//     "dfg2c3": "http://www.soundcloud.com"
//   },

//   "test": {
//     "dank": "http://www.dankmemes.com",
//     "img343": "http://www.imgur.com"
//   }
// };

const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userId: "userRandomID"
  },

  "asd123": {
    url: "http://www.reddit.com",
    userId: "user2RandomID"
  },

  "dfg2c3": {
    url: "http://www.soundcloud.com",
    userId: "user2RandomID"
  },

  "dank123": {
    url: "http://www.dankmemes.com",
    userId: "test"
  },

  "img343": {
    url: "http://www.imgur.com",
    userId: "test"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$HHAPpB1z/AQKqum8yTQHT.PWJ3l7WLv.Z0HQVz1vXJrKx4mnZSOKe"

  },
  
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$n5aG79MYuqU0ha1pvnebnuscJH3ubPKILt0NfGged/.8VotxdMhWO"
  },
  
  "test": {
    id: "test",
    email: "test@test.com",
    password: "$2a$10$4sFjLE/3EvVs5raZfpvuwOIsc.QqxLSVELamFJaFjZ7koHxCNixBS"
  }
};

function urlsForUser(id) {
  const urls = {};

  if (!id) {
    return urls;
  }
  for (let shortUrl in urlDatabase) {
    // console.log(typeof urlDatabase[shortUrl].userId, typeof id);
    if (urlDatabase[shortUrl].userId === id) {
      urls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return urls;
}
module.exports = {
  urlDatabase: urlDatabase,
  users: users,
  urlsForUser: urlsForUser
};