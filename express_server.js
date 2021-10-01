const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { generateRandomString, findUserByEmail, filterUrlDatabaseByUser } = require("./helpers");

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["This is a key for my project", "This is a second key and is really cool!"]
}));

// These are the data structures used in the project in place of true databases. I have left the example "database" entries active for now in case they are neccessary for Lighthouse Labs' project testing and evaluation purposes.
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


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


//ROUTE HANDLERS

// "/"
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  //if user logged in direct to /urls, else direct to /login
  if (user) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});


// "/URLS"
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    res.send("Error: You must be logged in to view this content.");
    return;
  }
  const urlsForUser = filterUrlDatabaseByUser(user.id, urlDatabase);
  const templateVars = {
    urls: urlsForUser,
    user
  };
  res.render("urls_index", templateVars);
});


// DELETE - Creating the POST route to remove a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  // ensuring user is logged in and owns the url in order to be able to delete it.
  // send an error message if not logged in
  if (!user) {
    res.send("Error: You must be logged in to view this content.");
    return;
  }
  // deny access if trying to delete a TinyURL not owned by the user
  const urlsForUser = filterUrlDatabaseByUser(user.id, urlDatabase);
  if (!urlsForUser[shortURL]) {
    res.send("Error: You don't own this TinyURL. You cannot update it.");
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// URLS/NEW - adding a new TinyURL
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user
  };
  // if user is not logged in redirect to login page
  if (!user) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

// Posting the information from the form and creating the new TinyURL
app.post("/urls", (req, res) => {
  // if user is not logged in, they cannot post here
  const user = users[req.session.user_id];
  if (!user) {
    res.send("Error: User must be logged in to POST.");
    return;
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user.id
  };
  res.redirect(`/urls/${shortURL}`);
});


// "/URLS/SHORTURL" 
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  // send an error message if not logged in
  if (!user) {
    res.send("Error: You must be logged in to view this content.");
    return;
  }
  // send an error message if the given ID doesn't exist
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.send("Error: The provided TinyURL does not exist");
    return;
  }
  // deny access if trying to acces a TinyURL not owned by the user
  const urlsForUser = filterUrlDatabaseByUser(user.id, urlDatabase);
  if (!urlsForUser[shortURL]) {
    res.send("Error: You don't own this TinyURL. You cannot update it.");
    return;
  }

  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});


// "/U/SHORTURL" - Provide a way for users to enter their TinyURL and have it redirect to the original long URL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
    
  } else {
    res.send("Error: TinyURL as entered doesn't exist.");
  }
});


// Providing the ability to Update a record
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.shortURL].longURL = newLongURL;
  res.redirect("/urls");
});


// Handling the Login functionality
// Endpoint for the user to login (GET "/login")
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  // if the user is already logged in, redirect to /urls
  if (user) {
    res.redirect('/urls');
  } else {
    res.render("login", templateVars);
  }
});

// Endpoint for the user to signin.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // this function returns the user object if present in users database, false otherwise.
  const user = findUserByEmail(email, users);

  // if user not found return error code
  if (user === false) {
    res.status(403);
    res.send("Error (403): User email not found.");
    return;
  }
  // if passwords don't match return error code
  if (!bcrypt.compareSync(password, user.hashedPassword)) {
    res.status(403);
    res.send("Error (403): Incorrect Password.");
    return;
  }
  // if everything is good to go, log user in by setting session cookie with the user.id value
  req.session.user_id = user.id;
  res.redirect('/urls');
});


// LOG-OUT - Endpoint for the user to signout. Clears the user_id cookie.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Handling REGISTRATION related endpoints
// Endpoint to GET /register
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  // if the user is already logged in, redirect to /urls
  if (user) {
    res.redirect('/urls');
  } else {
    res.render("regForm", templateVars);
  }
});

// Endpoint to POST /register: actually adding user info to users (db)
app.post("/register", (req, res) => {
  // Extract the data from the request
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);

  // Check to make sure neither email nor password are empty strings
  if (email === "" || password === "") {
    res.status(400);
    res.send("Error (400): email and/or password fields cannot be empty.");
    return;
  }
  // Check to make sure the user doesn't already exist
  // This function returns the user object if found, or false if not found
  const user = findUserByEmail(email, users);

  // Error if the user already exists
  if (user) {
    res.status(400);
    res.send("Error (400): Email already exists!");
    return;
  }
  
  // Create a unique id for the user record
  const UserId = generateRandomString();
  
  // Add the user's info to the users database object
  const UserInfo = {
    id: UserId,
    email,
    hashedPassword
  };
  users[UserId] = UserInfo;
  
  // log-in the user by assigning a session cookie
  req.session.user_id = users[UserId].id;
 
  // redirect the user to /urls
  res.redirect("/urls");
});

// Start the app listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});