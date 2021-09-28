const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//ROUTE HANDLERS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//REMOVE??? This specific code block may just have been for example.
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

//REMOVE??? This specific code block may just have been for example.
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Creating the POST route to remove a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// Adding a new Tiny URL
// Creating the form for the new url submission
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// Posting the information from the form
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/urls/${shortURL}`);
});




app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

// Provide a way for users to enter their TinyURL and have it redirect to the original long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Start the app listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});