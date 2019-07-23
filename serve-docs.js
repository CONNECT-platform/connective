const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('.'));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, req.originalUrl + '.html'));
});

app.listen(port, () => {
  console.log('CONNECTIVE docs being served on port 3000.');
});
