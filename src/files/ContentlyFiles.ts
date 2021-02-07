import path from 'path';
import { readFile } from 'fs/promises';
import globby from 'globby';
import isRepo from 'is-repo';
import fstat from './fstat';
import chokidar from 'chokidar';

/**
 * Absolute path to a file.
 * @name ContentlyPath
 */
export type ContentlyPath = string;

export interface ContentlyFile {
  path: ContentlyPath;

  /**
   * File contents
   * @name data
   */
  data: string;

  /**
   * File attributes
   * @name attributes
   */
  attributes: {
    createdAt: Date;
    modifiedAt: Date;
    [k: string]: any;
  };
}

export default class ContentlyFiles {
  public files: Map<ContentlyPath, ContentlyFile>;
  public isGitRepo: boolean = false;
  private watcher?: chokidar.FSWatcher;

  constructor(public cwd: ContentlyPath, public patterns: string[]) {
    this.files = new Map();

    isRepo(cwd).then(result => {
      this.isGitRepo = result;
    });
  }

  /**
   * Search for files
   * @param cwd Directory to search files in
   * @default cwd Contently instance cwd
   */
  async find(cwd = this.cwd) {
    const files = globby.stream(this.patterns, { cwd });

    for await (const file of files) {
      const filepath = path.resolve(cwd, file as string);

      if (!this.files.has(filepath)) {
        this.add(filepath);
      }
    }
  }

  /**
   * Add or update file
   */
  async add(filepath: ContentlyPath) {
    try {
      const data = await readFile(filepath, 'utf8');
      const attributes = await fstat(filepath, this.isGitRepo);

      const file = {
        path: filepath,
        data,
        attributes
      };

      this.files.set(filepath, file);
    } catch {
      throw new Error(`Could not read file ${filepath}`);
    }
  }

  /**
   * Remove file
   * @returns True on success, false if file didn't exist
   */
  remove(filepath: ContentlyPath) {
    return this.files.delete(filepath);
  }

  removeDir(dirpath: ContentlyPath) {
    for (const file of this.files.keys()) {
      const { dir } = path.parse(file);

      if (dir === dirpath) {
        this.files.delete(file);
      }
    }
  }

  public watch() {
    const { cwd, patterns } = this;

    this.watcher = chokidar.watch(patterns, { cwd });

    const listen = (
      event: string,
      listener: (filepath: ContentlyPath) => void
    ) => {
      this.watcher?.on(event, filepath => {
        const normalized = path.resolve(cwd, filepath);
        listener(normalized);
      });
    };

    listen('add', this.add);
    listen('change', this.add);
    listen('addDir', this.find);
    listen('unlink', this.remove);
    listen('unlinkDir', this.removeDir);
  }
}
