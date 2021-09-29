const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


//Helper Functions
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

//"Database" objects for use in the project

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
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user
  };
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
  const user = users[req.cookies["user_id"]];
  const templateVars = { 
    user
  };
  res.render("urls_new", templateVars);
});
// Posting the information from the form
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect(`/urls/${shortURL}`);
});




app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

// Provide a way for users to enter their TinyURL and have it redirect to the original long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Providing the ability to Update a record
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = newLongURL;
  res.redirect("/urls");
})

// Endpoint for the user to signin. Setting a cookie named username.
app.post("/login", (req, res) => {
  const usernameFromForm = req.body.username;
  res.cookie('username', usernameFromForm);
  res.redirect("/urls");
});

// Endpoint for the user to signout. Clears the username cookie.
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});
// Handling REGISTRATION related endpoints
// Endpoint to GET /register
app.get("/register", (req, res) => {
  res.render("regForm");
});

// Endpoint to POST /register: actually adding user info to users (db)
app.post("/register", (req, res) => {
  // Extract the data from the request
  const email = req.body.email;
  const password = req.body.password;


  // Check to make sure neither email nor password are empty strings
  if (email === "" || password === "") {
    res.status(400);
    res.send("Error (400): email and password fields cannot be empty.")
    return;
  }

  // Check to make sure the user doesn't already exist

  for (let user in users) {
    // Error if the user already exists
    if (users[user].email === email) {
      res.status(400);
      res.send("Error (400): Email already exists!")
      return;
    }
  }
  // Create a unique id for the user record
  const UserId = generateRandomString();
  
  // Add the user's info to the users database object
  const UserInfo = {
    id: UserId,
    email,
    password
  };
  users[UserId] = UserInfo;
  
  // log-in the user by assigning a cookie
  res.cookie("user_id", users[UserId].id);

  // redirect the user to /urls
  res.redirect("/urls");
})

// Start the app listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});