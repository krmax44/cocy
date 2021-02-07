import globby from 'globby';
import fs from 'fs/promises';

afterAll(async () => {
  const files = await globby('**/tests/**/*.tmp*');
  for (const file of files) {
    if ((await fs.lstat(file)).isDirectory()) {
      fs.rmdir(file, { recursive: true });
    } else {
      fs.unlink(file);
    }
  }
});
