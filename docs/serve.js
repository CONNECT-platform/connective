const path = require('path');
const express = require('express');
const app = express();
const generate = require('./generate');

const port = 3000;
const root = path.join(__dirname, '../');

app.use(express.static('.'));

app.get('/*', (req, res) => {
  res.sendFile(path.join(root, req.originalUrl + '.html'));
});

generate();

app.listen(port, () => {
  console.log(`CONNECTIVE docs being served on http://localhost:${port}`);
});
