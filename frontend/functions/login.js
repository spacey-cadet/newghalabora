/* eslint-disable no-undef */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "your_secret_key_here";
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

// Dummy users list
const users = [
  { username: "alice", password: "$2a$10$CwTycUXWue0Thq9StjUM0uJ8/8QwMvM/aCRY/ojm4MO1zfzxNEkQ6" },  // password: "password1"
  { username: "bob", password: "$2a$10$Cj1N7jPy9FpWxgSUpjjuQuoT0trrFr5gzSxuF0YeTiEOAZakMi.Ry" }    // password: "password2"
];

// Helper function to verify password
const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

// Helper function to authenticate a user
const authenticateUser = (username, password) => {
  const user = users.find(user => user.username === username);
  if (user && verifyPassword(password, user.password)) {
    return user;
  }
  return null;
};

// Helper function to create a JWT token
const createAccessToken = (data, expiresIn) => {
  return jwt.sign(data, SECRET_KEY, { expiresIn });
};

// Serverless function
exports.handler = async function (event) {
  const { username, password } = JSON.parse(event.body);

  // Authenticate the user
  const authenticatedUser = authenticateUser(username, password);

  if (!authenticatedUser) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Incorrect username or password" })
    };
  }

  // Create JWT token
  const token = createAccessToken({ sub: authenticatedUser.username }, `${ACCESS_TOKEN_EXPIRE_MINUTES}m`);

  // Return the token
  return {
    statusCode: 200,
    body: JSON.stringify({
      access_token: token,
      token_type: "bearer"
    })
  };
};