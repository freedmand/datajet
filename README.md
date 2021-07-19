# DataJet

A client-side tool for exploring SQLite databases. Inspired by [Datasette](https://datasette.io/), this tool aims to be a quick way to poke around datasets without having to stand up a server.

[Online Tool](https://datajet.pages.dev/)

## Usage

Install using npm:

```bash
npm install
```

Spawn a development server (by default on port 3000):

```bash
npm run dev
```

Build a productionized bundle:

```bash
npm run build
```

## License

MIT

## Credits

This package takes a lot of inspiration, both design and functionality-wise, from [Datasette](https://datasette.io/). It also uses the following libraries:

- [sql.js](https://github.com/sql-js/sql.js/), an entirely in-browser SQLite engine
- [x-canvas-table](https://github.com/xwinstone/canvastable), a highly performant canvas-based table renderer
- [localforage](https://github.com/localForage/localForage), an easy-to-use interface for the IndexedDB browser API, which enables storing large amounts of data locally (i.e. the functionality to save uploaded tables client-side)
