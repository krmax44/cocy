# Contently

The main Contently package.

## API

```ts
const instance = new Contently();
```

### `instance.use(plugin: ContentlyPluginSetup, options?: any): Contently`

```ts
type ContentlyPlugin = (this: ContentlyPlugin, options?: any) => any;
```

The plugin function will be invoked, allowing it to register hooks on `this.instance`.

### `instance.run(): Contently`

Runs the plugins in order. Returns `this`.

### `instance.addResult(result: ContentlyResult): Promise<Contently>`

Adds a new result to the instance. Returns `this`.

## Instance Hooks

You can hook into events on the instance.

```ts
instance.on('beforeAddResult', function(result: ContentlyResult) {
	// prepares your titles for YouTube
	result.attributes.title = result.attributes.title.toUpperCase();

	// you can also access the Contently instance via `this`.
	// Notice that this doesn't work with an arrow function.
	const { cwd } = this.options;
	console.log(`Welcome from ${cwd}!`);

	return result;
});
```

| Event              | Parameters    | Description                                                                    |
| ------------------ | ------------- | ------------------------------------------------------------------------------ |
| `beforeRun`        | _none_        | Fires before content is being processed.                                       |
| `run`              | _none_        | Fires after the `before` hook is done.                                         |
| `afterRun`         | _none_        | Fires after content was processed.                                             |
| `beforeAddResult`  | Result to add | Fires before a new result is added.                                            |
| `addResult`        | Added result. | Fires after a new result was added. Return value of your hook will be ignored. |
| `afterPluginAdded` | _none_        | Fires after a plugin was added. Return value of your hook will be ignored.     |
