const express = require('express');
const app = express();
const router = express.Router();

app.use((req, res, next) => {
  req.params = req.params || {};
  req.params.companyId = "GLOBAL";
  next();
});

router.get('/agents', (req, res) => {
  res.send(req.params.companyId);
});

app.use(router);

const server = app.listen(0, () => {
  const port = server.address().port;
  require('http').get(`http://localhost:${port}/agents`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log("Result:", data);
      server.close();
    });
  });
});
