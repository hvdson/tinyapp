var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).replace(/[^a-zA-Z0-9]+/g, '').substr(0, 6);
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("hello", (req, res) => {
  res.end("<html>></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase
  };
  res.render("pages/urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let tinyURL = generateRandomString();
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${tinyURL}`);
  // res.send();
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});