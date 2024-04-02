


const express = require("express");
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(6)
}

function userLookup(email) {
  for (user in users) {
    if (users[user].email == email) {
      return users[user]
    }
  }
  return null
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
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
    email: "ryan@gmail.com",
    password: "fun",
  },
};


app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// When user enters longURL on page urls_new and clicks SUBMIT, that longURL is added to urlDatabase along with an assinged short URL.
// User is then redirected to the urls_show page
app.post("/urls", (req, res) => {
  console.log("Test, ", req.body.longURL); 
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;

  if (!req.cookies["user"]) {
    res.status(400).send("You cannot shorten the URL because you are not logged in!");
  }
  

  res.redirect(`/urls/${id}`); // 
});

// When user enters login info in /login, a user {object} cookie is set, and user is redirected to /urls page
app.post("/login", (req, res) => {
  let user = userLookup(req.body.email)

  if (req.body.email == '' || req.body.password == '') {
    res.status(400).send('Email or password cannot be empty')
  } else if (userLookup(req.body.email) == null) {
    res.status(403).send('Email does not exist')
  } else if (user.password !== req.body.password) {
    res.status(403).send('Password does not match')
  } 

  res.cookie('user', user)
  res.redirect(`/urls`); // 

  /* 
  possible implementation in case bug where I only need the unique id
  res.cookie('user_id', user.id)
  */
});

// When user clicks on logout button, their username cookie is deleted, and user is redirected to /login page
app.post("/logout", (req, res) => {
  res.clearCookie('user')
  res.redirect(`/login`); // 
});

// when user enters information into email and password fields on register page, user {object} cookie is set 
// User is redirected to /urls
app.post("/register", (req, res) => {
  if (req.body.email == '' || req.body.password == '') {
    res.status(400).send('Email or password cannot be empty')
  } else if (userLookup(req.body.email) !== null) {
    res.status(400).send('Email is already in use')
  }

  let userId = generateRandomString();
  users[userId] = {id: userId, email: req.body.email, password: req.body.password};
  const value = users[userId]

  res.cookie('user', value)
  res.redirect(`/urls`); // 
})


// when user clicks DELETE, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect(`/urls`); // 

});

// when user enters updated URL and clicks SUBMIT, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.test
  res.redirect(`/urls`); // 

});

// when user clicks Login in _header, login page is rendered
app.get("/login", (req, res) => {
  const templateVars = { 
    user: req.cookies["user"],
  };

  if (req.cookies["user"]) {
    res.redirect(`/urls`);
  }


  res.render("login", templateVars);
});

// when user clicks Logout in _header, user {object} cookie is cleared and user is redirected to login page
app.get("/logout", (req, res) => {
  res.clearCookie('user')
  res.redirect(`/login`); // 
});

// when user clicks on register button in _header, the register page is rendered in HTML
app.get("/register", (req, res) =>{
  const templateVars = { 
    user: req.cookies["user"],
  };

  if (req.cookies["user"]) {
    res.redirect(`/urls`);
  }

  res.render("register", templateVars);

})

/// when user clicks on shortened URL on the urls/:id page, it redirects to website via longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  
  const longURL = urlDatabase[id];
  if (!longURL) {
    res.status(400).send('Shortened URL does not exist')
  }
  res.redirect(longURL);
});


// when user access page /urls.json, returns parsed urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// when user accesses /urls, renders urls_index
app.get("/urls", (req, res) => {
  
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["user"],
  };
  res.render("urls_index", templateVars);
});

// when user accesses /urls/new, renders urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: req.cookies["user"],
  };

  if (!req.cookies["user"]) {
    res.redirect(`/login`);
  }
  
  res.render("urls_new", templateVars);
});

// when user accesses /urls/:id, renders urls_show page with HTML updated with templateVars
app.get("/urls/:id", (req, res) => { 
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user"]
  };
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

