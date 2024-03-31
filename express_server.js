


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

app.post("/urls", (req, res) => {
  console.log("Test, ", req.body.longURL); // Log the POST request body to the console
  let id = generateRandomString();
  // console.log(id)
  urlDatabase[id] = req.body.longURL;
  // console.log(urlDatabase)
  res.redirect(`/urls/${id}`); // 
});

app.post("/urls/:id", (req, res) => {
  let id = req.params.id;
  res.redirect(`/urls/${id}`); // 
});

/// when user clicks on shortened URL it redirects to website via longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  // removes a URL resource
  //After the resource has been deleted, redirect the client back to the urls_index page ("/urls").
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect(`/urls`); // 

});

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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { 
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});