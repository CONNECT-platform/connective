const path = require('path');
const fs = require('fs');
const nunjucks = require('nunjucks');

const root = path.join(__dirname, '../');
const templatePath = path.join(__dirname, 'templates');
const targetPath = path.join(root, 'docs/');

nunjucks.configure(templatePath);

const render = (filename, outfile) => {
  console.log(`RENDERING ${filename} to ${outfile}`);
  let rendered = nunjucks.render(filename + '.njk');
  fs.writeFile(outfile, rendered, error => {
    if (error) {
      console.log('ERROR: could not render ' + filename);
      console.log(error);
    }
  });
}


module.exports = () => {
  console.log('GENERATING DOCS ...');
  render('index', path.join(root, 'index.html'));

  let files = fs.readdirSync(templatePath)
    .filter(file => file.endsWith('.njk'))        // only get templates
    .filter(file => !file.startsWith('_'))        // remove the parent templates
    .map(file => file.substr(0, file.length - 4)) // remove the extension
    .filter(file => file != 'index')              // index is already rendered
    ;

  files.forEach(file => render(file, path.join(targetPath, file + '.html')));

  console.log('CLEANING UP ...');

  fs.readdirSync(targetPath)
    .filter(file => file.endsWith('.html'))
    .map(file => file.substr(0, file.length - 5))
    .filter(file => !files.includes(file))
    .forEach(file => {
      console.log('REMOVING ' + file);
      fs.unlink(path.join(targetPath, file + '.html'), error => {
        if (error) {
          console.log('COULD NOT CLEAN ' + file);
          console.log(error);
        }
      });
    });

  console.log('DOCS GENERATED');
}
