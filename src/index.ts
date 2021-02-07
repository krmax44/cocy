import { ContentlyOptions } from './types/ContentlyOptions';
import slugify from 'slugo';
import { PATTERNS } from './consts';
import ContentlyFiles from './files/ContentlyFiles';

export default class Contently {
  public options: ContentlyOptions;
  public files: ContentlyFiles;

  constructor(options?: ContentlyOptions) {
    const cwd = process.cwd();
    const watch = process.env.NODE_ENV === 'development';

    this.options = {
      cwd,
      watch,
      patterns: PATTERNS,
      slugify,
      ...(options || {})
    };

    this.files = new ContentlyFiles(this.options.cwd, this.options.patterns);
  }

  public async build(files?: string) {}
}
