// --------------------------------------------------
// NODE PACKAGES
const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
// --------------------------------------------------

const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET_KEY || 'development']
}));

// getting database info
const database = require("./database.js");
const { urlDatabase, users, urlsForUser } = database;

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------
function registerFieldsEmpty(emailAddress, password, confirmPassword) {
  return (emailAddress === "" || password === "" || confirmPassword === "");
}

function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 6);
}

function passwordConfirmation(password, passwordConfirm) {
  return password === passwordConfirm;
}

// return user obj if email matches
// return false if doesn't exist
function databaseHasUserEmail(email) {
  // users is a global var
  for (let user in users) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
}

function shortUrlInCurrDatabase(urls, shortUrl) {
  for (let obj in urls) {

    console.log(obj, shortUrl);
    
    if (obj === shortUrl) {
      return true;
    }
  }
  return false;
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
// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------
// allows cookies to be stored in locals
// don't need templateVars for cookies now b/c user cookies are
// stored in the local obj of res(ponse)
// express.ejs handles this

app.use(function(req, res, next) {
  // everytime server receives a request first pass through middleware
  res.locals.user = users[req.session.userId];

  // POST that handles register && login will set the cookie
  // on first access of page w.o cookie will print { user: undefined }
  next();
});

// --------------------------------------------------
// GET requests:
// should only res(pond) with readable data - NOT changing anything
// --------------------------------------------------
app.get("/", (req, res) => {
  const urls = urlsForUser(req.session.userId);
  // You already have the user id
  // you have a function urlsForUser userId => urls
  let templateVars = {
    urls: urls
  };
  res.render("pages/urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const urls = urlsForUser(req.session.userId);
  let templateVars = {
    urls: urls
  };
  res.render("pages/urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urls = urlsForUser(req.session.userId);

  if (shortUrlInCurrDatabase(urls, req.params.id)) {

    const shortURL = req.params.id;
    const longURL = urls[shortURL].url;

    res.redirect(longURL);
  } else {
    res.redirect("/400");
  }
  
});

// app.get("/register", (req, res) => {
//   res.render("pages/register", {
//     user: users[req.session.userId]
//   });
// });

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.get("/urls/new", (req, res) => {
  if (res.locals.user) {
    res.render("pages/urls_new");
  }
  res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  // only the current user should be able to
  // access their own url based on req.params.id

  // this is shortened database obj
  const urls = urlsForUser(req.session.userId);

  // console.log(shortUrlInCurrDatabase(urls, req.params.id));
  // helper fntn to check if short url exists
  if (shortUrlInCurrDatabase(urls, req.params.id)) {
    const shortURL = req.params.id;
    let templateVars = {
      shortURL: shortURL,
      longURL: urls[shortURL].url
    };
    res.render("pages/urls_show", templateVars);
  } else {
    res.redirect("/urls");
  }
  
});

app.get("/login", (req, res) => {
  if (!res.locals.user) {
    res.render("pages/login");
  }
  res.redirect("/login");
});


app.get("/400", (req, res) => {
  res.render("pages/400");
});

// --------------------------------------------------
// POST requests
// --------------------------------------------------

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    url: req.body.longURL,
    userId: req.session.userId
  };

  res.redirect(`/urls/${shortURL}`);
  // res.send();
});

app.post("/urls/:id", (req, res) => {
  if (req.body.shortURL.length > 0) {
    urlDatabase[req.params.id].url = req.body.shortURL;
  }

  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
  // res.send();
});

app.post("/login", (req, res) => {
  
  // get the email, password & conf. from user input using deconstruction
  // request.body needs to set NAME as a key

  // ----------------------------------------------
  //  unnecessary but i like how it looks :)
  const obj = { email, password, confirmPassword } = req.body;
  // ----------------------------------------------

  // returns user if email is in database - false otherwise
  const user = getUserByEmail(email);
  // if the user exists from email lookup
  if (user) {
    // check if the password (and confirmPass) match database

    const hashedPass = bcrypt.compareSync(obj.password, user.password);
    const hashedConfirmPass = bcrypt.compareSync(obj.confirmPassword, user.password);

    // should return true if they match
    if (hashedPass && hashedConfirmPass) {
      console.log(user.password);
      // work normally
      req.session.userId = user.id;
      res.locals.user = user;
      res.redirect("/urls");
      // password field not correct - redirect
    } else {
      console.log("Passwords don't match.");
      res.status(403).redirect('/login');
    }
  } else {
    console.log("User doesn't exist");
    // alert("User not found - try again ");
    res.status(404).redirect('/login');
  }
});

app.post("/logout", (req, res) => {
  req.session.userId = null;
  // res.local.user = {};
  res.redirect(`/urls`);
  // res.send();
});

app.post("/register", (req, res) => {

  const id = generateRandomString();
  const { email, password, confirmPassword } = req.body;

  if (registerFieldsEmpty(email, password, confirmPassword)) {
    res.status(400).redirect("/400");
  } else if (confirmPassword !== password) {
    console.log("Password confirmation does not match!");
    res.status(400).redirect("/400");
  } else if (getUserByEmail(email)) {
    console.log("User already exists!");
    res.status(400).redirect("/400");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  
  req.session.userId = id;
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// font-family
// setminwidth on labels and forms
// whitespace is nice
// round corners for buttons
// background colour

// <a href="/urls/<%= obj %>"> edit</a>