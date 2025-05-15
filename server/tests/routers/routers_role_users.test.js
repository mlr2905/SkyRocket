const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

// Define the API you're testing
const apiURL = 'https://skyrocket.onrender.com/role_users/';
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

describe('API Tests', function () {
  // Example test for a GET request
  it('should GET all items by email', function (done) {
    const userEmail = 'idit@gmail.com'; // Replace with the email you want to test
    chai.request(apiURL)
      .get(`/role_users/users/search?email=${userEmail}`) // Endpoint adjusted to include email query parameter
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

  // GET /customers/:id
  it('should retrieve a customer by ID', function (done) {
    const customerId = 1; // Provide an existing customer ID for the test

    chai.request(apiURL)
      .get(`/customers/${customerId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // POST /customers
  it('should create a new customer', function (done) {
    const newCustomer = {
      Provide necessary customer data for the test
      Ensure data is unique for each test to avoid conflicts
    };

    chai.request(apiURL)
      .post('/customers')
      .send(newCustomer)
      .end((err, res) => {
        expect(res).to.have.status(201);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // PUT /customers/:id
  it('should update an existing customer', function (done) {
    const customerId = 1; // Provide an existing customer ID for the test
    const updatedCustomerData = {
      // Provide necessary updated customer data for the test
    };

    chai.request(apiURL)
      .put(`/customers/${customerId}`)
      .send(updatedCustomerData)
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // GET /flights
  it('should retrieve all flights', function (done) {
    chai.request(apiURL)
      .get('/flights')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // GET /flights/:id
  it('should retrieve a flight by ID', function (done) {
    const flightId = 1; // Provide an existing flight ID for the test

    chai.request(apiURL)
      .get(`/flights/${flightId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // POST /tickets
  it('should purchase a new ticket', function (done) {
    const newTicket = {
      // Provide necessary ticket data for the test
      // Ensure data is unique for each test to avoid conflicts
    };

    chai.request(apiURL)
      .post('/tickets')
      .send(newTicket)
      .end((err, res) => {
        expect(res).to.have.status(201);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // POST /passengers
  it('should create a new passenger', function (done) {
    const newPassenger = {
      // Provide necessary passenger data for the test
      // Ensure data is unique for each test to avoid conflicts
    };

    chai.request(apiURL)
      .post('/passengers')
      .send(newPassenger)
      .end((err, res) => {
        expect(res).to.have.status(201);
        // Add assertions to validate the response body if needed
        done();
      });
  });

  // GET /passengers/:id
  it('should retrieve a passenger by ID', function (done) {
    const passengerId = 1; // Provide an existing passenger ID for the test

    chai.request(apiURL)
      .get(`/passengers/${passengerId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Add assertions to validate the response body if needed
        done();
      });
  });

});
