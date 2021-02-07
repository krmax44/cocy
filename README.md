# Contently

[![CI status](https://img.shields.io/github/workflow/status/krmax44/contently/build/master)](https://github.com/krmax44/contently/actions)
[![Code coverage](https://img.shields.io/codecov/c/github/krmax44/contently?token=RcYyQnebV1)](https://codecov.io/gh/krmax44/contently)
[![npm version](https://img.shields.io/npm/v/contently)](https://www.npmjs.com/package/contently)

Contently takes your content and turns it into a consumable API for your [JAMstack](https://jamstack.org) site. The headless content management library, no matter what framework you're using.

⚠ Currently being rewritten.

## Goals

- fast performance
- easily approachable

## Roadmap to v1

see [TODO](https://github.com/krmax44/contently/search?q=TODO) in code, also:

- [ ] examples with frameworks, like Ream or Nuxt
- [ ] better docs
- [ ] extensive testing

## Example

```
📦 current working directory
 ┣ 📂 posts
 ┃ ┣ 📄 Hello-World.md
 ┃ ┣ 📄 Second-Post.md
```

```ts
import Contently from 'contently';
import ContentlyTransformMarkdown from 'contently-transform-markdown';

const contently = await new Contently({ cwd: './posts' })
	.use(ContentlyTransformMarkdown)
	.find();

for (const file of contently.files.values()) {
	console.log(file.slug);
}

/*
  output:
  hello-world
  second-post
*/
```
