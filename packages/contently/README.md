# Contently

The main Contently package.

## API

```ts
const instance = new Contently();
```

### `instance.use(plugin: ContentlyPlugin, options?: any): Contently`

```ts
type ContentlyPlugin = (instance: Contently, options?: any) => any;
```

The plugin function will be called once `run` is invoked. Returns `this`.

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

| Event              | Parameters    | Description                                                                |
| ------------------ | ------------- | -------------------------------------------------------------------------- |
| `beforeRun`        | _none_        | Fires before content is being processed.                                   |
| `run`              | _none_        | Fires after the `before` hook is done.                                     |
| `afterRun`         | _none_        | Fires after content was processed.                                         |
| `beforeAddResult`  | Result to add | Fires before a new result is added.                                        |
| `afterPluginAdded` | _none_        | Fires after a plugin was added. Return value of your hook will be ignored. |
