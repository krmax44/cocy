# Contently

The main Contently package.

## API

```ts
const instance = new Contently();
```

## `instance.use(plugin: ContentlyPlugin, options?: any): Contently`

```ts
type ContentlyPlugin = (instance: Contently, options?: any) => any;
```

The plugin function will be called once `run` is invoked. Returns `this`.

## `instance.run(): Contently`

Runs the plugins in order. Returns `this`.

## `instance.addResult(result: ContentlyResult): Contently`

Adds a new result to the instance. Returns `this`.
