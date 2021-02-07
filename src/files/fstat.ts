import gitFstat from 'git-fstat';
import { stat } from 'fs/promises';

export default async function fstats(
  path: string,
  gitRepo: boolean
): Promise<{ createdAt: Date; modifiedAt: Date }> {
  if (gitRepo) {
    const { createdAt, modifiedAt } = await gitFstat(path);
    return { createdAt, modifiedAt };
  }

  const { birthtime: createdAt, mtime: modifiedAt } = await stat(path);
  return { createdAt, modifiedAt };
}
