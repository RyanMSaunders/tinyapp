const userLookup = require('./helpers');


const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());

const bcrypt = require("bcryptjs");

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'whatever',
  keys: ['hellohello'],

  // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));



const generateRandomString = function() {
  return Math.random().toString(36).substring(6);
};

// function userLookup(email, database) {
//   for (user in database) {
//     if (database[user].email == email) {
//       return database[user]
//     }
//   }
//   return null
// }

// Create a function named urlsForUser(id) which returns the URLs 
// where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id) {
  const usersUrls = {};
  let count = 0;
  const urlDatabaseKeys = Object.keys(urlDatabase);
  // console.log(urlDatabaseKeys)
  for (let index in urlDatabase){
    // console.log(index);
    // console.log(urlDatabase[index].userID); // only recognizing "aJ48lW"
    if (id === urlDatabase[index].userID) {
      console.log('test', urlDatabase[index].userID); // "user4RandomID"
      console.log(count);
      console.log('test2', index); // i want this to be a short url


      // add longURL to userUrls object
      // console.log(urlDatabaseKeys[count]);
      usersUrls[index] = urlDatabase[index].longURL;  // adds keys value pair to userURLS
      count += 1;
    }
    // how do i access the key of each object in the urlDatabase object
    // console.log(usersUrls);
  }
  // console.log(usersUrls);
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

// console.log(urlsForUser("aJ48lW"));



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
  let id = generateRandomString(); // id here is 'short url'
  urlDatabase[id] = {longURL: req.body.longURL}; // takes longurl input from url-new page and updates URL Database
  urlDatabase[id]["userID"] = req.session.user.id;
  // console.log('test', urlDatabase); 
  // console.log(req.session.user.id);
  /// Do these need to be added to USERS urls rather than URL database?

  if (!req.session.user) {
    res.status(400).send("You cannot shorten the URL because you are not logged in!");
  }
  
// Why, when there are existing urls in the urlDatabase, does my code break
// why does it give me a 'you have not added this url' message (check u/:id)
// why does it add the first url id's in the url database
// why when I click delete does the short url change in urls_index but the long url remains

  res.redirect(`/urls/${id}`); // 
});

// When user enters login info in /login, a user {object} cookie is set, and user is redirected to /urls page
app.post("/login", (req, res) => {
  // check if users password is correct using bcrypt.compareSyn(plaintext, hashedPassword)
  
  // console.log(userPassword);
  // console.log(req.body.password);

  if (req.body.email == '' || req.body.password == '') {
    res.status(400).send('Email or password cannot be empty');
  } else if (userLookup(req.body.email, users) == null) {
    res.status(403).send('Email does not exist');
  } 
  
  let user = userLookup(req.body.email, users);
  let userPassword = user.password;

  if(!bcrypt.compareSync(req.body.password, userPassword)) {
    res.status(403).send('Password does not match');
  }
  
  
  // else if (user.password !== req.body.password) {
  //   res.status(403).send('Password does not match')
  // } 

  req.session.user = user;
  res.redirect(`/urls`); // 

  /* 
  possible implementation in case bug where I only need the unique id
  res.cookie('user_id', user.id)
  */
});

// When user clicks on logout button, their username cookie is deleted, and user is redirected to /login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`); // 
});

// when user enters information into email and password fields on register page, user {object} cookie is set 
// User is redirected to /urls
app.post("/register", (req, res) => {
  
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  // console.log('hash', hash);

  if (req.body.email == '' || req.body.password == '') {
    res.status(400).send('Email or password cannot be empty');
  } else if (userLookup(req.body.email, users) !== null) {
    res.status(400).send('Email is already in use');
  }

  let userId = generateRandomString();
  users[userId] = {id: userId, email: req.body.email, password: hash};
  const value = users[userId];

  req.session.user = value;
  /// what is req.session.user = value
  // res.cookie('user', value)
  res.redirect(`/urls`); // 
});


// when user clicks DELETE, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/delete", (req, res) => {
  
  const id = req.params.id;
  const urlDatabaseKeys = Object.keys(urlDatabase);
  if (!urlDatabaseKeys.includes(id)) {
    res.status(400).send('This URL does not exist!');
  }

  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

//////////
  const userURLs = urlsForUser(req.session.user.id);

  const userURLsKeys = Object.keys(userURLs);
  // console.log(userURLsKeys);
  if (!userURLsKeys.includes(id)) {
      res.status(400).send('You have not added this url!');
  } 
////////////

  delete urlDatabase[id];
  res.redirect(`/urls`); 

});

// when user enters updated URL and clicks SUBMIT, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;

  // console.log(req.body.edit);
  // console.log(urlDatabase[id].longURL);

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
  // const id = req.params.id;
  if (req.body.edit !== '') {
    urlDatabase[id].longURL = req.body.edit; 
  } else {
    res.status(400).send('Long url cannot be an empty string');
  }
  
  res.redirect(`/urls`); // 
});



////////////////////////////////////////////////////////////////



// when user clicks Login in _header, login page is rendered
app.get("/login", (req, res) => {
  const templateVars = { 
    user: req.session.user,
    // why req.session.user?
    // to render the login page with a header
  };

  if (req.session.user) {
    res.redirect(`/urls`);
  }


  res.render("login", templateVars);
});

// when user clicks Logout in _header, user {object} cookie is cleared and user is redirected to login page
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`); // 
});

// when user clicks on register button in _header, the register page is rendered in HTML
app.get("/register", (req, res) =>{
  const templateVars = { 
    user: req.session.user,
  };

  if (req.session.user) {
    res.redirect(`/urls`);
  }

  res.render("register", templateVars);

});

/// when user clicks on shortened URL on the urls/:id page, it redirects to website via longURL
app.get("/u/:id", (req, res) => {
  
  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.session.user.id);
  const userURLsKeys = Object.keys(userURLs);
  const id = req.params.id; // it can identify the correct it
  const longURL = urlDatabase[id].longURL; 
  // console.log(longURL);

  if (!userURLsKeys.includes(req.params.id)) {
      res.status(400).send('You have not added this url!');
  }
  

  if (!longURL) {
    res.status(400).send('Shortened URL does not exist');
  }
  // console.log("test 3", longURL);
  res.redirect(longURL);
});


// when user access page /urls.json, returns parsed urlDatabase
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// when user accesses /urls, renders urls_index 
app.get("/urls", (req, res) => {
  // only show the logged in users urls
  // filter the database and pass in the filtered urls to templateVars

  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }
  // console.log(req.session.user.id);
  const usersUrls = urlsForUser(req.session.user.id); // is that it? needs to take email and database?
  // console.log(usersUrls);


  const templateVars = { 
    urls: usersUrls,
    user: req.session.user,
  };

  // theres something goin on in template vars that wont allow template vars to pass long url 
  //<%= urls[id].longURL %>
  // i had to change urls[id].longURL to urls[id]

 
  res.render("urls_index", templateVars);
});

// when user accesses /urls/new, renders urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: req.session.user,
    // I need to somehow aquire the user id and paste into longURL: urlDatabase[req.params.id].longURL,
    // longURL: urlDatabase[user.id].longURL,
  };

  // console.log(templateVars)

  if (!req.session.user) {
    res.redirect(`/login`);
  }
  
  res.render("urls_new", templateVars);
});

// when user accesses /urls/:id, renders urls_show page with HTML updated with templateVars
app.get("/urls/:id", (req, res) => { 
  const id = req.params.id;
  const urlDatabaseKeys = Object.keys(urlDatabase);
  if (!urlDatabaseKeys.includes(id)) {
    res.status(400).send('This URL does not exist!');
  }

  if (!req.session.user) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }
  const templateVars = { 
    // urls: urlDatabase,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.user
  };
  // console.log(templateVars.longURL); // templateVars.longURL is coming up undefined. Which is why its not rendering in the show template
  // console.log(urlDatabase[req.params.id]) // also undefined
  // console.log(req.params.id) // y7lb6n, this works.
  // console.log(urlDatabase[req.params.id]); // 67ybtml, https://github.com/RyanMSaunders/tinyapp
  
  res.render("urls_show", templateVars);
});

// communicates to console that server is listening on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


/////////////

// when user accesses page /hello, sends  hello
app.get("/", (req, res) => {
  res.send("Hello!");
});


// when user access page /hello, sends bolded hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

