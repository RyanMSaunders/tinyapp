const { getUserByEmail } = require('./helpers');


const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({extended:false}));
app.use(express.json());


const bcrypt = require("bcryptjs");

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'whatever',
  keys: ['hellohello']
}));



const generateRandomString = function() {
  return Math.random().toString(36).substring(6);
};


const urlsForUser = function(id) {
  const usersUrls = {};
  for (let index in urlDatabase) {
    
    if (id === urlDatabase[index].userID) {
      usersUrls[index] = urlDatabase[index].longURL;
    }
  }
  return usersUrls;
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};




const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "ryan@gmail.com",
    password: "fun"
  },

  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "ryans@gmail.com",
    password: "funs",
  },
  user4RandomID: {
    id: "user4RandomID",
    email: "r@gmail.com",
    password: "$2a$10$P9ek5RCeILBWf/O/OXZiteAU0pNGiwmIhoKdPWFc1nsFtAx3FpGXS", // '1234'
  }
};




// When user enters longURL on page urls_new and clicks SUBMIT, that longURL is added to urlDatabase along with an assinged short URL.
// User is then redirected to the urls_show page
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = {longURL: req.body.longURL};
  urlDatabase[id]["userID"] = req.session.user.id;

  if (!req.session.user) {
    res.status(400).send("You cannot shorten the URL because you are not logged in!");
  }

  res.redirect(`/urls/${id}`);
});

// When user enters login info in /login, a user {object} cookie is set, and user is redirected to /urls page
app.post("/login", (req, res) => {
  
  if (req.body.email == '' || req.body.password == '') {
    res.status(400).send('Email or password cannot be empty');
  } else if (getUserByEmail(req.body.email, users) == null) {
    res.status(403).send('Email does not exist');
  }

  let user = getUserByEmail(req.body.email, users);
  let userPassword = user.password;

  if (!bcrypt.compareSync(req.body.password, userPassword)) {
    res.status(403).send('Password does not match');
  }

  req.session.user = user;
  res.redirect(`/urls`);
});

// When user clicks on logout button, their username cookie is deleted, and user is redirected to /login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// When user enters information into email and password fields on register page, user {object} cookie is set 
// User is redirected to /urls
app.post("/register", (req, res) => {
  
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);

  if (req.body.email == '' || req.body.password == '') {
    res.status(400).send('Email or password cannot be empty');
  } else if (getUserByEmail(req.body.email, users) !== null) {
    res.status(400).send('Email is already in use');
  }

  let userId = generateRandomString();
  users[userId] = {id: userId, email: req.body.email, password: hash};
  const value = users[userId];

  req.session.user = value;
  res.redirect(`/urls`);
});


// When user clicks DELETE, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/delete", (req, res) => {
  
  const id = req.params.id;
  const urlDatabaseKeys = Object.keys(urlDatabase);
  if (!urlDatabaseKeys.includes(id)) {
    res.status(400).send('This URL does not exist!');
  }

  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.session.user.id);

  const userURLsKeys = Object.keys(userURLs);
  if (!userURLsKeys.includes(id)) {
    res.status(400).send('You have not added this url!');
  }
  delete urlDatabase[id];
  res.redirect(`/urls`);

});

// When user enters updated URL on urls_show page and clicks SUBMIT, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;

  const urlDatabaseKeys = Object.keys(urlDatabase);
  if (!urlDatabaseKeys.includes(id)) {
    res.status(400).send('This URL does not exist!');
  }

  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.session.user.id);
  const userURLsKeys = Object.keys(userURLs);

  if (!userURLsKeys.includes(id)) {
    res.status(400).send('You have not added this url!');
  }
  
  if (req.body.edit !== '') {
    urlDatabase[id].longURL = req.body.edit;
  } else {
    res.status(400).send('Long url cannot be an empty string');
  }
  
  res.redirect(`/urls`);
});



////////////////////////////////////////////////////////////////



// When user clicks Login in _header, login page is rendered
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user,
  };

  if (req.session.user) {
    res.redirect(`/urls`);
  }

  res.render("login", templateVars);
});

// when user clicks Logout in _header, user {object} cookie is cleared and user is redirected to login page
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// When user clicks on register button in _header, the register page is rendered in HTML
app.get("/register", (req, res) =>{
  const templateVars = {
    user: req.session.user,
  };

  if (req.session.user) {
    res.redirect(`/urls`);
  }
  res.render("register", templateVars);
});

/// When user clicks on shortened URL on the urls/:id page, it redirects to external website via longURL
app.get("/u/:id", (req, res) => {
  
  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.session.user.id);
  const userURLsKeys = Object.keys(userURLs);
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!userURLsKeys.includes(req.params.id)) {
    res.status(400).send('You have not added this url!');
  }
  if (!longURL) {
    res.status(400).send('Shortened URL does not exist');
  }
  res.redirect(longURL);
});

// When user accesses /urls via _header or redirection, renders urls_index 
app.get("/urls", (req, res) => {
  
  if (!req.session.user) {
    res.status(403).send('<a href="/login">Please Log In</a>');
  }
  const usersUrls = urlsForUser(req.session.user.id);

  const templateVars = {
    urls: usersUrls,
    user: req.session.user,
  };
 
  res.render("urls_index", templateVars);
});

// When user accesses /urls/new via button in _header or link on urls_index, renders urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user,
  };

  if (!req.session.user) {
    return res.status(302).redirect(`/login`);
  }
  
  res.render("urls_new", templateVars);
});

// When user accesses /urls/:id, renders urls_show page with HTML updated with templateVars
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const urlDatabaseKeys = Object.keys(urlDatabase);
  
  if (!urlDatabaseKeys.includes(id)) {
    res.status(404).send('This URL does not exist!');
  }

  if (!req.session.user) {
    return res.status(302).redirect('/login');
  }

  const userURLs = urlsForUser(req.session.user.id);
  const userURLsKeys = Object.keys(userURLs);

  if (!userURLsKeys.includes(req.params.id)) {
    res.status(403).send('You have not added this url!');
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.user
  };
  
  res.render("urls_show", templateVars);
});


// When user accesses page /, redirects to /urls if logged in, redirects to /login if not logged in
app.get("/", (req, res) => {
  if (!req.session.user) {
    return res.status(302).redirect(`/login`);
  } else {
    res.redirect('/urls');
  }
});

// communicates to console that server is listening on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

