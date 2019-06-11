const Mocha = require('mocha');
import * as path from 'path';

const mocha = new Mocha();
const root = path.join(__dirname, 'src/');

const test = (file: string) => mocha.addFile(path.join(root, file));

test('test/index.ts');

mocha.run(console.log);
