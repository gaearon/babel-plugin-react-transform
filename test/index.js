import path from 'path';
import fs from 'fs';
import assert from 'assert';
import { transformFileSync } from 'babel-core';
import plugin from '../src';

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

describe('Fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  fs.readdirSync(fixturesDir).map((caseName) => {
    describe(caseName, () => {
      const fixtureDir = path.join(fixturesDir, caseName);
      let actualPath = path.join(fixtureDir, 'actual.js');
      const { ast, code } = transformFileSync(actualPath);

      const should = ast.comments.length
        ? ast.comments.map(({ value }) => trim(value)).join(" ")
        : `should ${caseName.split('-').join(' ')}`;

      it(should, () => {
        if (path.sep === '\\') {
          // Specific case of windows, transformFileSync return code with '/'
          actualPath = actualPath.replace(/\\/g, '/');
        }

        const expected = fs.readFileSync(
          path.join(fixtureDir, 'expected.js')
        ).toString().replace(/%FIXTURE_PATH%/g, actualPath);

        assert.equal(trim(code), trim(expected));
      });
    });
  });
});
