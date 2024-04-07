
const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(user.id == expectedUserID, 'User found');

  });
  it('should return undefined with email that is not valid', function() {
    const user = getUserByEmail("userxyz@example.com", testUsers)
    // const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert(!user, 'User not found');

  });
});