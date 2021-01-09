# Penguin Engine

> A small game engine for webgames implemented in typescript.

## Usage

First install the engine by using npm install.
```bash
npm install penguin-engine
```

Then you can use it like this.
```typescript
import Engine, { arrays, components, Entity, gui, geometry, systems } from "penguin-engine";
```

## Contribute

In case you want to contribute the engine and implement features you should install it editable from git.

```bash
git clone git@....
cd penguin-engine
npm install
npm run build
npm link
cd ../YOUR_PROJECT
npm link penguin-engine
```

Now you can import the game engine in your project and instead of using the published version you are using the latest git version.
When you do a change to the engine, simply build it again.

```bash
cd penguin-engine
npm run build
```

Happy coding!


# License

The MIT License (MIT)

Copyright (c) 2020 Michael Fuerst, Tim Gengenbach

(full text see [LICENSE](LICENSE))
