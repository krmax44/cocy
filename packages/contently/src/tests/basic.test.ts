import path from 'path';
import fs from 'fs/promises';
import Contently from '../Contently';
import wait from 'waait';

const FIXTURE_ROOT = path.join(__dirname, 'fixture');
const TEST_FILE = path.join(FIXTURE_ROOT, 'test.md');

const TEST_FOLDER = path.join(FIXTURE_ROOT, 'folder');
const TEST_FILE_DEEP = path.join(TEST_FOLDER, 'inner.md');

function makeInstance() {
  return new Contently({ cwd: FIXTURE_ROOT });
}

describe('ContentlyFiles', () => {
  const files = makeInstance();
  files.watch();

  test('finds all files', async () => {
    await fs.mkdir(TEST_FOLDER);
    await fs.writeFile(TEST_FILE_DEEP, '');

    await files.find();
    const file = files.files.get(TEST_FILE);

    expect(file).toEqual({
      path: TEST_FILE,
      data: 'Test!\n',
      attributes: {
        createdAt: new Date('2021-02-07T16:37:42.000Z'),
        modifiedAt: new Date('2021-02-07T16:37:42.000Z')
      }
    });
    expect(files.files.has(TEST_FILE_DEEP)).toBe(true);
  });

  const TEST_FILE_2 = path.join(FIXTURE_ROOT, 'test-2.tmp.md');
  const TEST_CONTENT = 'Test!';

  test('finds new file', async () => {
    await fs.writeFile(TEST_FILE_2, TEST_CONTENT);
    await wait(100);

    const file = files.files.get(TEST_FILE_2);

    expect(file?.path).toEqual(TEST_FILE_2);
    expect(file?.data).toEqual(TEST_CONTENT);
  });

  test('removes file', async () => {
    await fs.unlink(TEST_FILE_2);
    await wait(200);

    expect(files.files.has(TEST_FILE_2)).toBe(false);
  });

  test('removes folder', async () => {
    await fs.rmdir(TEST_FOLDER, { recursive: true });
    await wait(200);

    expect(files.files.has(TEST_FILE_DEEP)).toBe(false);
  });
});