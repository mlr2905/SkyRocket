const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

// Define the API you're testing
const apiURL = 'https://skyrocket.onrender.com/role_airlines';
const expectedUser = {
  "id": 1, "username": "Idit Rozental", "password": "jsad439", "email": "idit@gmail.com", "role_id": 1, "role_name": "user"
};

describe('API Tests', function () {
  // Example test for a GET request
  it('should GET all items by email', function (done) {
    const userEmail = 'idit@gmail.com'; // Replace with the email you want to test
    chai.request(apiURL)
      .get(`/users/search?email=${userEmail}`) // Endpoint adjusted to include email query parameter
      .auth('michael', 'Miki260623') // Add authentication credentials
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(expectedUser); // Deep equal to compare objects
        // Optionally, you can add more assertions to validate the response data
        done();
      });
  });
});


// GET /users/search
it('should return user by username', function (done) {
  request(app)
    .get('/users/search')
    .query({ username: 'Egyptair' })
    .auth('michael', 'Miki260623') // Add authentication credentials
    .expect(200)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.have.property('username', 'Egyptair');
      done();
    });
});

// Add more tests for other scenarios...

// GET /users/search
it('should return 404 for non-existent user', function (done) {
  request(app)
    .get('/users/search')
    .query({ id: 4 })
    .auth('michael', 'Miki260623') // Add authentication credentials
    .expect(404)
    .end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.have.property('error');
      done();
    });
});

  // Example test for a GET request
  it('should GET all items by email', function (done) {
    const userEmail = 'idit@gmail.com'; // Replace with the email you want to test
    chai.request(apiURL)
      .get(`/users/search?email=${userEmail}`) // Endpoint adjusted to include email query parameter
      .auth('michael', 'Miki260623') // Add authentication credentials
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(expectedUser); // Deep equal to compare objects
        // Optionally, you can add more assertions to validate the response data
        done();
      });
  });

  // POST /users
  it('should create a new user', function (done) {
    const newUser = {
      // Provide necessary user data for the test
      // Ensure data is unique for each test to avoid conflicts
    };

    chai.request(apiURL)
      .post('/users')
      .send(newUser)
      .end((err, res) => {
        expect(res).to.have.status(201);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // PUT /users/:id
  it('should update an existing user', function (done) {
    const userId = 1; // Provide an existing user ID for the test
    const updatedUserData = {
      // Provide necessary updated user data for the test
    };

    chai.request(apiURL)
      .put(`/users/${userId}`)
      .send(updatedUserData)
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // DELETE /users/:id
  it('should delete an existing user', function (done) {
    const userId = 1; // Provide an existing user ID for the test

    chai.request(apiURL)
      .delete(`/users/${userId}`)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });


  // GET /airlines/:id
  describe('GET /airlines/:id', function() {
      it('should return an airline by ID if it exists', function(done) {
          chai.request(apiURL)
              .get('/airlines/1') // Assuming the ID 1 exists
              .auth('michael', 'Miki260623') // Add authentication credentials
              .end((err, res) => {
                  expect(res).to.have.status(200);
                  expect(res.body).to.be.an('object');
                  // Add more assertions based on the response body schema
                  done();
              });
      });

      it('should return a 404 error if airline is not found', function(done) {
          chai.request(apiURL)
              .get('/airlines/999') // Assuming the ID 999 does not exist
              .auth('michael', 'Miki260623') // Add authentication credentials
              .end((err, res) => {
                  expect(res).to.have.status(404);
                  expect(res.body).to.have.property('error');
                  // Add more assertions based on the error response
                  done();
              });
      });
  });

  // POST /airlines
  describe('POST /airlines', function() {
      it('should create a new airline', function(done) {
          const newAirline = { /* valid airline data */ }; // Adjust to valid airline data
          chai.request(apiURL)
              .post('/airlines')
              .auth('michael', 'Miki260623') // Add authentication credentials
              .send(newAirline)
              .end((err, res) => {
                  expect(res).to.have.status(201);
                  expect(res.body).to.be.an('object');
                  // Add more assertions based on the response body schema
                  done();
              });
      });

      it('should return a 409 error if airline username or email already exist', function(done) {
          const existingAirline = { /* existing airline data */ }; // Adjust to existing airline data
          chai.request(apiURL)
              .post('/airlines')
              .auth('michael', 'Miki260623') // Add authentication credentials
              .send(existingAirline)
              .end((err, res) => {
                  expect(res).to.have.status(409);
                  expect(res.body).to.have.property('error');
                  // Add more assertions based on the error response
                  done();
              });
      });
  });

  // PUT /airlines/:id
  describe('PUT /airlines/:id', function() {
      it('should update an airline by ID', function(done) {
          const updatedAirlineData = { /* updated airline data */ }; // Adjust to valid updated airline data
          chai.request(apiURL)
              .put('/airlines/1') // Assuming the ID 1 exists
              .auth('michael', 'Miki260623') // Add authentication credentials
              .send(updatedAirlineData)
              .end((err, res) => {
                  expect(res).to.have.status(200);
                  expect(res.body).to.be.an('object');
                  // Add more assertions based on the response body schema
                  done();
              });
      });

      it('should return a 404 error if airline is not found', function(done) {
          const updatedAirlineData = { /* updated airline data */ }; // Adjust to valid updated airline data
          chai.request(apiURL)
              .put('/airlines/999') // Assuming the ID 999 does not exist
              .auth('michael', 'Miki260623') // Add authentication credentials
              .send(updatedAirlineData)
              .end((err, res) => {
                  expect(res).to.have.status(404);
                  expect(res.body).to.have.property('error');
                  // Add more assertions based on the error response
                  done();
              });
      });
  });


