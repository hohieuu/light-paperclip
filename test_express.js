const express = require('express');
const app = express();
const router = express.Router();

app.use((req, res, next) => {
  // Try to inject or override params
  req.params.companyId = "GLOBAL";
  next();
});

router.get('/companies/:companyId/agents', (req, res) => {
  res.send(req.params.companyId);
});

app.use(router);

const request = require('supertest');
request(app).get('/companies/123/agents').then(res => {
  console.log("Result:", res.text);
});
