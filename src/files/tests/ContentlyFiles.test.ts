import ContentlyFiles from '../ContentlyFiles';
import path from 'path';
import { PATTERNS } from '../../consts';

const FIXTURE_ROOT = path.join(__dirname, 'fixture');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

function makeInstance() {
  return new ContentlyFiles(FIXTURE_ROOT, PATTERNS);
}

describe('it discovers all files', async () => {
  const files = makeInstance();
  await files.find();
  expect(files.files.get(TEST_FILE)).toEqual({
    path: TEST_FILE,
    data: 'Test!\n',
    attributes: {}
  });
});
