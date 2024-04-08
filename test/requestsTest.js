
/////// From Compass

const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  //// PASSING
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b6UTxQ"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "r@gmail.com", password: "1234" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b6UTxQ").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  /// PASSING
  it('should return 404 for GET /urls/NOTEXISTS', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "r@gmail.com", password: "1234" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/NOTEXISTS").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(404);
        });
      });
  });


  //// PASSING (without explicitly checking for status 302)
  it('user should receive status code 302 and redirect to /login if they are not logged in and access GET /urls/:id', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get('/urls/b6UTxQ')
      .redirects(0)
      .then(res => {
        expect(res).to.redirect;
        expect(res).to.have.status(302);
        // expect(res.redirects[0]).to.include('/login');
  
        // expect(res).to.have.status(302);
        // expect(res.text).to.include('<a href="/login">Please Log In</a>');
      });
  });


  it('user should receive status code 302 and redirect to /login if they are not logged in and access GET /urls/new', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get('/urls/new')
      .redirects(0)
      .then(res => {
        expect(res).to.redirect;
        expect(res).to.have.status(302);
  
      });
  });

  it('user should receive status code 302 and redirect to /login if they are not logged in and access GET /', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get('/')
      .redirects(0)
      .then(res => {
        expect(res).to.redirect;
        expect(res).to.have.status(302);
  
      });
  });
});