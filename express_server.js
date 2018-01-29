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

// Checks if the url follows standard convention
// returns type: false or string
// false: if the url isn't valid
// String: either same string or corrected to add protocol
function checkCorrectUrl(url) {
  const regexUrl = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
  const regexHttp = new RegExp("^(http|https)://", "i");
  // .test() returns a boolean if found in url
  const matchUrl = regexUrl.test(url);
  const matchHttp = regexHttp.test(url);
  // check if valid url
  if (matchUrl) {
    // check if protocol exists
    if (matchHttp) {
      // return as is
      return url;
    } else {
      // add protocol to url
      return `https://${url}`;
    }
  }
  // invalid url
  return false;
}

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------
// allows cookies to be stored in locals
// don't need templateVars for cookies now b/c user cookies are
// stored in the local obj of res(ponse)
// express.ejs handles this

app.use( (req, res, next) => {
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

// assuming page displaying links is also homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// handles displaying links only to corresponding user
app.get("/urls", (req, res) => {
  // will not show any links for a person w/o cookie
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
    req.session.error = "Link does not exist.";
    res.redirect("/error/404");
  }
  
});

// ERROR HANDLING
// redirects user to an error page showing http cat
app.get("/error/:id", (req, res) => {
  let templateVars = {
    errorMsg: req.session.error,
    httpCat: req.params.id
  };
  res.render("pages/error", templateVars);
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.get("/urls/new", (req, res) => {
  if (res.locals.user) {
    res.render("pages/urls_new");
  } else {
    // add an error msg to the cookie
    // req.session.error = "Please login first.";
    // res.redirect("/error/401");
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  // only the current user should be able to
  // access their own url based on req.params.id
  const urls = urlsForUser(req.session.userId);
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
    req.session.error = "Please login or register to create a TinyURL!.";
    let templateVars = {
      errorMsg: req.session.error
    };
    res.render("pages/login", templateVars);
  } else {
  // had it redirect to /login before and was caught in redirect loop
  // happens when user is logged in but tries to access /login from address bar
    res.redirect("/");
  }
});

// handles incorrect requests from address bar
app.get("*", (req, res) => {
  req.session.error = "Page does not exist :(";
  res.redirect("/error/404");
});

// app.get("/400", (req, res) => {
//   res.render("pages/400");
// });

// --------------------------------------------------
// POST requests
// --------------------------------------------------

app.post("/urls", (req, res) => {
  // helper fntn to check if http/https exists in the field
  // TODO: implement helper fntn
  const newUrl = checkCorrectUrl(req.body.longURL);

  // ------
  if (!newUrl) {
    req.session.error = "Please enter a valid url";
    res.redirect("/error/400");
  } else {
  // ------
  // asssume that the url has http:// attatched
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      url: newUrl,
      userId: req.session.userId
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// handles changing link for a given shortUrl
app.post("/urls/:id", (req, res) => {
  // need to check if the updated url is valid
  const newUrl = checkCorrectUrl(req.body.shortURL);
  if (!newUrl) {
    req.session.error = "Please enter a valid url";
    res.redirect("/error/400");
  } else {
    urlDatabase[req.params.id].url = newUrl;
    res.redirect(`/urls`);
  }
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

  // first check if the fields are filled in
  if (!registerFieldsEmpty(email, password, confirmPassword)) {
    // returns user if email is in database - false otherwise
    const user = getUserByEmail(email);
    // if the user exists from email lookup
    if (user) {
      // check if the password (and confirmPass) match database

      const hashedPass = bcrypt.compareSync(obj.password, user.password);
      const hashedConfirmPass = bcrypt.compareSync(obj.confirmPassword, user.password);
      
      // check if fields are empty

      // should return true if they match
      if (hashedPass && hashedConfirmPass) {
        // work normally
        req.session.userId = user.id;
        res.locals.user = user;
        res.redirect("/urls");
      } else {
        // password field not correct - redirect
        req.session.error = "Please enter your info correctly to login.";
        res.redirect("/error/400");
      }
    } else {
      req.session.error = "Please enter your info correctly to login.";
      res.redirect("/error/400");
    }
  } else {
    req.session.error = "Please enter your info correctly to login.";
    res.redirect("/error/400");
  }
});

app.post("/logout", (req, res) => {
  // clear the cookie
  req.session = null;
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password, confirmPassword } = req.body;

  if (registerFieldsEmpty(email, password, confirmPassword)) {
    req.session.error = "Please enter all info.";
    res.redirect("/error/400");
  } else if (confirmPassword !== password) {
    req.session.error = "Passwords don't match!";
    res.redirect("/error/400");
  } else if (getUserByEmail(email)) {
    req.session.error = "User already exists!";
    res.redirect("/error/400");
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[id] = {
      id: id,
      email: email,
      password: hashedPassword
    };
    
    req.session.userId = id;
    res.redirect(`/urls`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});