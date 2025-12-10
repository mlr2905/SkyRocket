import http from 'k6/http';
import { check, sleep } from 'k6';

//  PowerShell command : --> k6 run -e EMAIL_K6="YOUR_REAL_mail@gmail.com" -e PASSWORD_K6="YOUR_REAL_PASSWORD" server/tests/load_test.js

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'https://skyrocket.onrender.com';

const email = __ENV.EMAIL_K6;
const password = __ENV.PASSWORD_K6;

export default function () {
  if (!email || !password) {
      console.error('Error: EMAIL_K6 and PASSWORD_K6 environment variables must be set.');
      return;
  }

  const loginPayload = JSON.stringify({
    email: email, 
    password: password,
    deviceId: 'load-test-device'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let loginRes = http.post(`${BASE_URL}/role_users/login`, loginPayload, params);

  check(loginRes, {
    'logged in successfully': (r) => r.status === 200,
  });

  if (loginRes.status !== 200) {
      console.error('Login failed:', loginRes.status, loginRes.body);
      sleep(1);
      return;
  }

  let customerRes = http.get(`${BASE_URL}/role_users/customers/me`);

  check(customerRes, {
    'customer details retrieved': (r) => r.status === 200,
  });
  
  let ticketsRes = http.get(`${BASE_URL}/role_users/my-tickets`);
  check(ticketsRes, { 'tickets retrieved': (r) => r.status === 200 });

  sleep(1); 
}