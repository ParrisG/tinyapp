//Helper Functions

//This function produces a random string (used for creating unique Ids)
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

//This function checks to see if a provided email is in the users db. It returns the entire user object if found, or false.
const findUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email.toLowerCase() === email.toLowerCase()) {
      return users[user];
    }
  }
  return false;
};

//This function loops through the urlDatabase and returns all the records (as a new db type object) belonging to a specific user.
const filterUrlDatabaseByUser = (user_id, database) => {
  const ownedUrlDatabase = {};
  for (let record in database) {
    if (database[record].userID === user_id) {
      ownedUrlDatabase[record] = database[record];
    }
  }
  return ownedUrlDatabase;
  
}

module.exports = { generateRandomString, findUserByEmail, filterUrlDatabaseByUser };