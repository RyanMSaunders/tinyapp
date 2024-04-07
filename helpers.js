/// HELPERS

const userLookup = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
      // return user;
    }
  }
  return null;
}


module.exports = userLookup;