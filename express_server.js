var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function registerFieldsEmpty(emailAddress, password) {
  return (emailAddress === "" && password === "");
}

function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 6);
}

function getUserByEmail(email) {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return false;
}

// Middleware

app.use(function(req, res, next) {
  res.locals.user = users[req.cookies.user_id];
  console.log(res.locals);
  next();
});
// GET request
// ---------------------------------------------
app.get("/", (req, res) => {
  // console.log("username: ", req);
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("pages/urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("pages/urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("pages/register", {
    user: users[req.cookies.user_id]
  });
});

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("pages/urls_show", templateVars);
});

// POST requests
// ---------------------------------------------

app.post("/urls", (req, res) => {
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${tinyURL}`);
  // res.send();
});

app.post("/urls/:id", (req, res) => {

  if (req.body.shortURL.length > 0) {
    urlDatabase[req.params.id] = req.body.shortURL;
  }
  // console.log(req.body.shortURL);
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
  // res.send();
});

app.post("/login", (req, res) => {

  const email = req.body.email;
  const user = getUserByEmail(email);

  if (user) {
    res.cookie("user_id", user.id);
    res.redirect(`/urls`);
  } else {
    res.status(404).redirect('/register');
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
  // res.send();
});

app.post("/register", (req, res) => {
  // console.log("[---------- request ----------]");
  // console.log(res);
  // console.log("[---------- response ----------]");

  // const newUserId = generateRandomString();
  // const emailAddress = req.body.emailAddress;
  // const password = req.body.password;

  // if (registerFieldsEmpty(emailAddress, password)) {
  //   res.status(400).render("pages/400");
  // }
  
  // if (!users.hasOwnProperty(newUserId)) {
  //   users[newUserId] = {};
  // }
  
  // users[newUserId]["user_id"] = newUserId;
  // users[newUserId]["email"] = req.body.emailAddress;
  // users[newUserId]["password"] = req.body.password;

  // res.cookie("user_id", newUserId);

  // let templateVars = {
    // urls: urlDatabase
  // };
  // console.log(req.cookies.user_id);

  // res.render(`pages/urls_index`, templateVars);

  const id = generateRandomString();
  const { email, password } = req.body;

  if (registerFieldsEmpty(email, password)) {
    res.status(400).render("pages/400");
  } 

  users[id] = {
    email: email,
    password: password
  };
  
  res.cookie("user_id", id);

  res.redirect(`/urls`);
  // QUESTION asky why below prints undefined in console
  // console.log(res.cookie.username);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// font-family
// setminwidth on labels and forms
// whitespace is nice
// round corners for buttons
// background colour