# Contently Render JSON

Generates static JSON files.

## Usage

```ts
import ContentlyRenderJSON from 'contently-render-json';

contently.use(ContentlyRenderJSON, options?);
```

## Options

```ts
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
```
