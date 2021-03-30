# Cocy Render JSON

Generates static JSON files.

## Usage

```ts
import CocyRenderJSON from 'cocy-render-json';

cocy.use(CocyRenderJSON, options?);
```

## Options

```ts
interface Options {
	/**
	 * Output directory for built JSON files
	 * @default outDir cocy in cwd's parent
	 */
	outDir?: string;

	/**
	 * Clean directory before build
	 * @default clean false
	 */
	clean?: boolean;
}
```
