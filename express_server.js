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
  },
  
  "test": {
    id: "test",
    email: "test@test.com",
    password: "test"
  }


};

function registerFieldsEmpty(emailAddress, password) {
  return (emailAddress === "" && password === "");
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

function getUserByEmail(email) {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return false;
}

// MIDDLEWARE
// ---------------------------------------------
// allows cookies to be stored in locals
// don't need templateVars for cookies now b/c user cookies are
// stored in the local obj of res(ponse)
// express.ejs handles this

app.use(function(req, res, next) {
  // everytime server receives a request first pass through middleware
  res.locals.user = users[req.cookies.user_id];
  // POST that handles register && login will set the cookie
  // on first access of page w.o cookie will print { user: undefined }
  console.log(res.locals);
  next();
});


// GET requests:
// should only res(pond) with readable data - NOT changing anything
// ---------------------------------------------

app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  // express only looks for FILES the views directory
  res.render("pages/urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("pages/urls_index", templateVars);
});

// app.get("/register", (req, res) => {
//   res.render("pages/register", {
//     user: users[req.cookies.user_id]
//   });
// });

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.get("/urls/new", (req, res) => {
  if (!res.locals.user) {
    res.redirect("/login");
  }
  res.render("pages/urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  res.render("pages/urls_show", templateVars);
});

app.get("/login", (req, res) => {
  res.render("pages/login");
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
  
  // get the email, password & conf. from user input using deconstruction
  // request.body needs to set NAME as a key
  const obj = { email, password, confirmPassword } = req.body;
  console.log(obj.email, obj.password, obj.confirmPassword);
  // returns user if email is in database - false otherwise
  const user = getUserByEmail(email);
  console.log(user);
  // if the user exists from email lookup
  if (user) {
    // check if the password (and confirmPass) match database
    if (obj.password === user.password && obj.confirmPassword === user.password) {

      // work normally
      res.locals.user = user;
      res.cookie("user_id", user.id);
      // res.locals.user = {};
      
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
  res.clearCookie("user_id");
  // res.local.user = {};
  res.redirect(`/urls`);
  // res.send();
});

app.post("/register", (req, res) => {

  const id = generateRandomString();
  const { email, password, confirmPassword } = req.body;

  if (registerFieldsEmpty(email, password)) {
    res.status(400).render("pages/400");
  } else if (confirmPassword !== password) {
    console.log("Password confirmation does not match!");
    res.status(400).redirect("/register");
  } else if (getUserByEmail(email)) {
    console.log("User already exists!");
    // https://stackoverflow.com/questions/9269040/which-http-response-code-for-this-email-is-already-registered
    res.status(409).redirect("/register");
  }

  users[id] = {
    id: id,
    email: email,
    password: password
  };
  
  res.cookie("user_id", id);

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