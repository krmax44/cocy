import gitFstat from 'git-fstat';
import { promises as fs } from 'fs';

export default async function fstats(
	path: string,
	gitRepo: boolean
): Promise<{ createdAt: Date; modifiedAt: Date }> {
	// Even in a git repo, gitFstat may fail (i. e. the file isn't committed yet)
	// we'll use fs stat in that case
	try {
		if (gitRepo) {
			const { createdAt, modifiedAt } = await gitFstat(path);
			if (createdAt) return { createdAt, modifiedAt };
		}
	} catch {} // eslint-disable-line no-empty

	const { birthtime: createdAt, mtime: modifiedAt } = await fs.stat(path);
	return { createdAt, modifiedAt };
}
