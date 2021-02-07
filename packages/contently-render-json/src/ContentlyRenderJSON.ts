import fs from 'fs/promises';
import path from 'path';
import Contently, { ContentlyFile } from 'contently';

interface Options {
  /**
   * Output directory for built JSON files
   * @default outDir contently in cwd's parent
   */
  outDir?: string;

  /**
   * Clean directory before build
   * @default clean false
   */
  clean?: boolean;
}

export default async function ContentlyRenderJSON(
  instance: Contently,
  options: Options = {}
) {
  const outDir =
    options?.outDir || path.resolve(instance.options.cwd, '..', 'contently');

  if (options.clean) {
    await fs.rmdir(outDir, { recursive: true });
    await fs.mkdir(outDir);
  }

  instance.on('addFile', renderFile);
  instance.on('updateFile', renderFile);
  instance.on('removeFile', removeFile);

  function determineLocation(file: ContentlyFile) {
    const relativePath = path.relative(instance.options.cwd, file.path);
    const { dir, name } = path.parse(relativePath);

    const folder = path.resolve(outDir, dir);
    const filepath = path.resolve(folder, `${name}.json`);

    return { folder, filepath };
  }

  async function renderFile(file: ContentlyFile) {
    const json = JSON.stringify(file);
    const { folder, filepath } = determineLocation(file);
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(filepath, json);
  }

  function removeFile(file: ContentlyFile) {
    try {
      const { filepath } = determineLocation(file);
      fs.unlink(filepath);
    } catch {}
  }
}
