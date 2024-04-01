


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).substring(6)
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// When user enters longURL on page urls_new and clicks SUBMIT, that longURL is added to urlDatabase along with an assinged short URL.
// User is then redirected to the urls_show page
app.post("/urls", (req, res) => {
  console.log("Test, ", req.body.longURL); // Log the POST request body to the console
  let id = generateRandomString();
  // console.log(id)
  urlDatabase[id] = req.body.longURL;
  // console.log(urlDatabase)
  res.redirect(`/urls/${id}`); // 
});

// When user enters login info in _header, a username cookie is set, and user is redirected to /urls page
app.post("/login", (req, res) => {
  // set a cookie named username to the value submitted in the request body via the login form
  // redirect the browser back to the /urls page
  const value = req.body.username
  // console.log(value)
  res.cookie('username', value)
  res.redirect(`/urls`); // 
});

/// when user clicks on shortened URL on the urls/:id page, it redirects to website via longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// when user clicks DELETE, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/delete", (req, res) => {
  // removes a URL resource
  //After the resource has been deleted, redirect the client back to the urls_index page ("/urls").
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect(`/urls`); // 

});

// when user enters updated URL and clicks SUBMIT, urlDatabase is updated and user is redirected to urls_index
app.post("/urls/:id/edit", (req, res) => {
  // update the value of your stored long URL based on req body
  // redirect the client back to /urls
  const id = req.params.id;
  console.log(req.body)
  
  // console.log(urlDatabase)
  urlDatabase[id] = req.body.test
  // console.log(req.body)
  res.redirect(`/urls`); // 

});

// when user access page /hello, sends  hello
app.get("/", (req, res) => {
  res.send("Hello!");
});


// when user access page /hello, sends bolded hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// when user access page /urls.json, returns parsed urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// when user accesses /urls, renders urls_index
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

// when user accesses /urls/new, renders urls_new
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

// when user accesses /urls/:id, renders urls_show page with HTML updated with templateVars
app.get("/urls/:id", (req, res) => { 
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// when user accesses urls/:id, redirect to urls_show 
// app.get("/urls/:id", (req, res) => {
//   let id = req.params.id;
//   res.redirect(`/urls/${id}`); // 
// });

// communicates to console that server is listening on port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

