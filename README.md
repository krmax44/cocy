# Contently

[![Build Status](https://travis-ci.com/krmax44/contently.svg?branch=master)](https://travis-ci.com/krmax44/contently)

Contently takes your content and turns it into a consumable API for your [JAMstack](https://jamstack.org) site. Currently under development, see the [roadmap](https://github.com/krmax44/contently/projects/1)

## Goals

- fast performance
- highly configurable
- wide use-case
- easily approachable

## Documentation

Each package has its own documentation:

- [contently](https://github.com/krmax44/contently/blob/master/packages/contently/README.md)
- [contently-json-api](https://github.com/krmax44/contently-json-api/blob/master/packages/contently/README.md)
- [contently-source-fs](https://github.com/krmax44/contently-source-fs/blob/master/packages/contently/README.md)
- [contently-transform-markdown](https://github.com/krmax44/contently-transform-markdown/blob/master/packages/contently/README.md)

## Examples

### Usage with frameworks

Take a look at the following example repos:

- [Nuxt.js template](https://github.com/krmax44/nuxt-template-contently)
- [Sapper template](https://github.com/krmax44/sapper-template-contently) - :warning: WIP

### Standalone

```
📦 current working directory
 ┣ 📂 posts
 ┃ ┣ 📄 Hello-World.md
 ┃ ┣ 📄 Second-Post.md
 ┣ 📂 content

```

```bash
yarn add contently contently-source-fs contently-transform-markdown contently-json-api
```

```js
const Contently = require('contently');
const ContentlySourceFs = require('contently-source-fs');
const ContentlyTransformMarkdown = require('contently-transform-markdown');
const ContentlyJsonApi = require('contently-json-api');

new Contently()
	.use(ContentlySourceFs, { patterns: ['posts/*.md'] })
	.use(ContentlyTransformMarkdown)
	.use(ContentlyJsonApi)
	.run()
	.then(data => console.log('Done!', data));
```

Which will generate...

```
📦 current working directory
 ┣ 📂 posts
 ┃ ┣ 📄 Hello-World.md
 ┃ ┣ 📄 Second-Post.md
 ┣ 📂 content
 ┃ ┣ 📄 hello-world.json
 ┃ ┣ 📄 second-post.json
```

...which you can use with your static site generator! Take a look at a JSON file:

```json
{
	"slug": "hello-world",
	"data": "<h1>Hello World</h1>\n<p>Hello from Contently!</p>\n",
	"attributes": {
		"createdAt": "2019-09-06T11:51:55.052Z",
		"modifiedAt": "2019-09-06T11:51:55.052Z",
		"title": "Hello-World"
	},
	"assets": []
}
```
