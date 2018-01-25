var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 6);
}

app.get("/", (req, res) => {
  console.log("username: ", req);
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  // res.render("pages/urls_index", templateVars);
  res.render("pages/urls_index", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("pages/urls_index", templateVars);
});

// app.get("/u/:shortURL", (req, res) => {
//   let longURL = urlDatabase[req.params.shortURL];
//   res.redirect(longURL);
// });

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("pages/urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("pages/urls_show", templateVars);
});


app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  // QUESTION asky why below prints undefined in console
  // console.log(res.cookie.username);
  let templateVars = {
    username: req.cookies["username"]
  };
  res.redirect(`/urls`);
  // res.send();
});

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

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.cookies["username"]);
  res.redirect(`/urls`);
  // res.send();
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// font-family
// setminwidth on labels and forms
// whitespace is nice
// round corners for buttons
// background colour