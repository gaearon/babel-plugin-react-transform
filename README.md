# babel-plugin-react-transform

This Babel plugin wraps all React components into arbitrary transforms written by the community.  
In other words, **it lets you instrument React components** in any custom way.

Such transforms can do a variety of things:

* catch errors inside `render()` and render them in a [red screen of death](https://github.com/KeywordBrain/redbox-react);
* enable hot reloading a la [React Hot Loader](https://github.com/gaearon/react-hot-loader);
* render an inline prop inspector a la [React DevTools](https://github.com/facebook/react-devtools);
* highlight parts of the screen when components update,
* etc.

The limit is your imagination and the time you feel compelled to spend on writing these transforms.  
Time will show whether it is an amazing, or a terrible idea.

## Installation

First, install the plugin:

```
npm install --save-dev babel-plugin-react-transform
```

Then, install the transforms you’re interested in:

```
# Okay, these don't actually exist yet but I'll publish them soon
npm install --save-dev react-transform-webpack-hmr
npm install --save-dev react-transform-catch-errors
```

Then edit your `.babelrc` to include `extra.babel-plugin-react-transform`.  
It must be an array of the transforms you want to use:

```js
{
  "stage": 0,
  "plugins": [
    "babel-plugin-react-transform"
  ],
  "extra": {
    // must be defined and be an array
    "babel-plugin-react-transform": [{
      // can be an NPM module name or a local path
      "target": "react-transform-webpack-hmr",
      // will be available as options.imports to the transform
      "imports": ["react"],
      // will be available as options.locals to the transform
      "locals": ["module"]
    }, {
      // can be an NPM module name or a local path
      "target": "react-transform-catch-errors",
      // will be available as options.imports to the transform
      "imports": ["react", "redbox-react"]
    }, {
      // can be an NPM module name or a local path
      "target": "./src/my-custom-transform"
    }]
  }
}
```

As you can see each transform, apart from the `target` field where you write it name, also has `imports` and `locals` fields. You should consult the docs of each individual transform to learn which `imports` and `locals` it might need, and how it uses them. You probably already guessed that this is just a way to inject local variables (like `module`) or dependencies (like `react`) into the transforms that need them.

## Writing a Transform

It’s not hard to write a custom transform! First, make sure you call your NPM package `react-transform-*` so we have uniform naming across the transforms. The only thing you should export from your transform module is a function.

```js
export default function myTransform() {
  // ¯\_(ツ)_/¯
}
```

This function should *return another function*:

```js
export default function myTransform() {
  return function wrap(ReactClass) {
    // ¯\_(ツ)_/¯
    return ReactClass;
  }
}
```

As you can see, you’ll receive `ReactClass` as a parameter. It’s up to you to do something with it: monkeypatch its methods, create another component with the same prototype and a few different methods, wrap it into a higher-order component, etc. Be creative!

```js
export default function logAllUpdates() {
  return function wrap(ReactClass) {
    const displayName = // ¯\_(ツ)_/¯
    const originalComponentDidUpdate = ReactClass.prototype.componentDidUpdate;

    ReactClass.prototype.componentDidUpdate = function componentDidUpdate() {
      console.info(`${displayName} updated:`, this.props, this.state);

      if (originalComponentDidUpdate) {
        originalComponentDidUpdate.apply(this, arguments);
      }
    }

    return ReactClass;
  }
}
```

Oh, how do I get `displayName`?  
Actually, we give your transformation function a single argument called `options`. Yes, `options`:

```js
export default function logAllUpdates(options) {
```

It contains some useful data. For example, your `options` could look like this:

```js
{
  // the file being processed
  filename: '/Users/dan/p/my-projects/src/App.js',
  // remember that "imports" .babelrc option?
  imports: [React],
  // remember that "locals" .babelrc option?
  locals: [module],
  // all components declared in the current file
  components: {
    $_MyComponent: {
      // with their displayName when available
      displayName: 'MyComponent'
    },
    $_SomeOtherComponent: {
      displayName: 'SomeOtherComponent',
      // and telling whether they are defined inside a function
      isInFunction: true
    }
  }
}
```

Of course, you might not want to use *all* options, but isn’t it nice to know that you have access to them in the top scope—which means before the component definitions actually run? (Hint: a hot reloading plugin might use this to decide whether a module is worthy of reloading, even if it contains an error and no React components have yet been wrapped because of it.)

So, to retrieve the `displayName` (or `isInFunction`, when available), use the `options` parameter *and* the second `uniqueId` parameter given to the inner function after `ReactClass`:

```js
export default function logAllUpdates(options) {
  return function wrap(ReactClass, uniqueId) {
    const displayName = options.components[uniqueId].displayName || '<Unknown>';
```

This is it!

Sure, it’s a slightly contrived example, as you can grab `ReactClass.displayName` just fine, but it illustrates a point: you have information about all of the components inside a file before that file executes, which is *very* handy for some transformations.

Here is the complete code for this example transformation function:

```js
export default function logAllUpdates(options) {
  return function wrap(ReactClass, uniqueId) {
    const displayName = options.components[uniqueId].displayName || '<Unknown>';
    const originalComponentDidUpdate = ReactClass.prototype.componentDidUpdate;

    ReactClass.prototype.componentDidUpdate = function componentDidUpdate() {
      console.info(`${displayName} updated:`, this.props, this.state);

      if (originalComponentDidUpdate) {
        originalComponentDidUpdate.apply(this, arguments);
      }
    }

    return ReactClass;
  }
}
```

Now go ahead and write your own!  
Don’t forget to tag it with `react-transform` keyword on npm.

## License

MIT
