# Cocy

[![CI status](https://img.shields.io/github/workflow/status/krmax44/cocy/build/main)](https://github.com/krmax44/cocy/actions)
[![Code coverage](https://img.shields.io/codecov/c/github/krmax44/cocy?token=RcYyQnebV1)](https://codecov.io/gh/krmax44/cocy)
[![npm version](https://img.shields.io/npm/v/cocy)](https://www.npmjs.com/package/cocy)

Cocy takes your static-file content and turns it into a consumable API for your [JAMstack](https://jamstack.org) site. The headless content management library, no matter what framework you're using.

## Packages

Docs are provided per package.

| Name                                                  | Description                | Package                                                                                                                 |
| ----------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [cocy](./packages/cocy/README.md)                     | main docs                  | [![npm version](https://img.shields.io/npm/v/cocy)](https://www.npmjs.com/package/cocy)                                 |
| [transform-md](./packages/transform-md/README.md)     | Transform Markdown to HTML | [![npm version](https://img.shields.io/npm/v/@cocy/transform-md)](https://www.npmjs.com/package/@cocy/transform-md)     |
| [transform-yaml](./packages/transform-yaml/README.md) | Parse YAML files           | [![npm version](https://img.shields.io/npm/v/@cocy/transform-yaml)](https://www.npmjs.com/package/@cocy/transform-yaml) |
| [render-json](./packages/render-json/README.md)       | Output static JSON files   | [![npm version](https://img.shields.io/npm/v/@cocy/render-json)](https://www.npmjs.com/package/@cocy/render-json)       |

## Roadmap to v1

see [TODO](https://github.com/krmax44/cocy/search?q=TODO) in code, also:

- [ ] examples with frameworks, like Ream or Nuxt
- [ ] better docs
- [ ] extensive testing
- [x] new name

## Example

```
📦 current working directory
 ┣ 📂 posts
 ┃ ┣ 📄 Hello-World.md
 ┃ ┣ 📄 Second-Post.md
```

```ts
import Cocy from 'cocy';
import md from '@cocy/transform-md';

const cocy = new Cocy({ patterns: ['./posts/*.md'] });

cocy.use(md); // use md processor
await cocy.discover(); // search for files

for (const file of cocy.files.values()) {
	console.log(file.slug);
}

/*
  output:
  hello-world
  second-post
*/

const { data } = cocy.files.getBySlug('hello-world');
console.log(data);

/*
  output:
  <p>Hey!</p>
*/
```
