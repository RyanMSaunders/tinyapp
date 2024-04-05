


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

// Create a function named urlsForUser(id) which returns the URLs 
// where the userID is equal to the id of the currently logged-in user.
function urlsForUser(id) {
  // urlDatabase[id]["userID"] = req.cookies["user"].id;
  // userID from database 
  // id of currently logged in user from cookies // req.cookies["user"].id

// loop throughh the urlDatabase
// check the userID key for equality with id input
  const usersUrls = {}  
  let count = 0 
  const urlDatabaseKeys = Object.keys(urlDatabase)
  // console.log(urlDatabaseKeys)


  for (index in urlDatabase){
    // console.log(urlDatabase[index].userID);
    
    if (id == urlDatabase[index].userID) {
      // add longURL to userUrls object
      // console.log(urlDatabaseKeys[count]);
      usersUrls[urlDatabaseKeys[count]] = urlDatabase[index].longURL;
      count += 1
    }
    // how do i access the key of each object in the urlDatabase object
    // console.log(usersUrls);

  }
  // console.log(usersUrls);
  return usersUrls;
}


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
};


app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// When user enters longURL on page urls_new and clicks SUBMIT, that longURL is added to urlDatabase along with an assinged short URL.
// User is then redirected to the urls_show page
app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = {longURL: req.body.longURL}; // takes longurl input from url-new page and updates URL Database
  urlDatabase[id]["userID"] = req.cookies["user"].id;
  // console.log('test', urlDatabase);

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
  const urlDatabaseKeys = Object.keys(urlDatabase)
  if (!urlDatabaseKeys.includes(id)) {
    res.status(400).send('This URL does not exist!');
  }

  if (!req.cookies["user"]) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.cookies["user"].id)
  const userURLsKeys = Object.keys(userURLs) 

  if (!userURLsKeys.includes(id)) {
      res.status(400).send('You have not added this url!');
  } 

  
  delete urlDatabase[id]
  res.redirect(`/urls`); 

});

// when user enters updated URL and clicks SUBMIT, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/edit", (req, res) => {
  
  const id = req.params.id
  const urlDatabaseKeys = Object.keys(urlDatabase)
  if (!urlDatabaseKeys.includes(id)) {
    res.status(400).send('This URL does not exist!');
  }

  if (!req.cookies["user"]) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.cookies["user"].id)
  const userURLsKeys = Object.keys(userURLs) 

  if (!userURLsKeys.includes(id)) {
      res.status(400).send('You have not added this url!');
  } 

  // const id = req.params.id;
  urlDatabase[id].longURL = req.body.edit 
  res.redirect(`/urls`); // 

});



////////////////////////////////////////////////////////////////



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
// need to check for if requested :id is in users registered id's
// check usersURLS
// create Object.keys() array
// filter array and check if truthy
// if truthy then continue with defining longURL from urlDatabase
// alternative is to define longURL from usersURLs

  
  
  if (!req.cookies["user"]) {
    res.status(400).send('<a href="/login">Please Log In</a>');
  }

  const userURLs = urlsForUser(req.cookies["user"].id)
  const userURLsKeys = Object.keys(userURLs)

  if (!userURLsKeys.includes(req.params.id)) {
      res.status(400).send('You have not added this url!');
    } else {
    const id = req.params.id; // it can identify the correct it
    const longURL = urlDatabase[id].longURL; 
    
    if (!longURL) {
      res.status(400).send('Shortened URL does not exist')
    }
    // console.log("test 3", longURL)
    res.redirect(longURL);
  }
});


// when user access page /urls.json, returns parsed urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// when user accesses /urls, renders urls_index 
app.get("/urls", (req, res) => {
  // only show the logged in users urls
  // filter the database and pass in the filtered urls to templateVars

  if (!req.cookies["user"]) {
    res.status(400).send('<a href="/login">Please Log In</a>')
  }
  const usersUrls = urlsForUser(req.cookies["user"].id)
  // console.log(usersUrls);

  const templateVars = { 
    urls: usersUrls,
    user: req.cookies["user"],
  };

  // theres something goin on in template vars that wont allow template vars to pass long url 
  //<%= urls[id].longURL %>
  // i had to change urls[id].longURL to urls[id]

 
  
  


  res.render("urls_index", templateVars);
});

// when user accesses /urls/new, renders urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: req.cookies["user"],
    // I need to somehow aquire the user id and paste into longURL: urlDatabase[req.params.id].longURL,
    // longURL: urlDatabase[user.id].longURL,
  };

  // console.log(templateVars)

  if (!req.cookies["user"]) {
    res.redirect(`/login`);
  }
  
  res.render("urls_new", templateVars);
});

// when user accesses /urls/:id, renders urls_show page with HTML updated with templateVars
app.get("/urls/:id", (req, res) => { 
  if (!req.cookies["user"]) {
    console.log('hello');
    res.status(400).send('<a href="/login">Please Log In</a>');
  }
  
  const templateVars = { 
    urls: urlDatabase,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: req.cookies["user"]
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

