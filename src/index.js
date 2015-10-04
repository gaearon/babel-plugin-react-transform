import path from 'path';
import parsePath from 'path-parse';

export default function ({ Plugin, types: t }) {
  const parentDir = path.resolve(path.join(__dirname, '..', '..'));
  function resolvePathConservatively(specifiedPath, filePath) {
    if (specifiedPath[0] === '.') {
      throw new Error(
        `Relative path like ${specifiedPath} is only allowed if ` +
        `babel-plugin-react-transform is inside a node_modules folder.`
      );
    }
    return specifiedPath;
  }
  function resolvePathAssumingWeAreInNodeModules(specifiedPath, filePath) {
    if (specifiedPath[0] === '.') {
      return '.' + path.sep + path.relative(
        path.dirname(filePath),
        path.resolve(path.join(parentDir, '..', specifiedPath))
      );
    }
    return specifiedPath;
  }
  const resolvePath = path.basename(parentDir) === 'node_modules' ?
    resolvePathAssumingWeAreInNodeModules :
    resolvePathConservatively;

  const depthKey = '__reactTransformDepth';
  const foundJSXKey = '__reactTransformFoundJSX';
  const recordsKey = '__reactTransformRecords';
  const wrapComponentIdKey = '__reactTransformWrapComponentId';
  const optionsKey = '__reactTransformOptions';
  const cacheKey = '__reactTransformCache';

  function isRenderMethod(member) {
    return member.kind === 'method' &&
           member.key.name === 'render';
  }

  /**
   * Does this class have a render function?
   */
  function isComponentishClass(cls) {
    return cls.body.body.filter(isRenderMethod).length > 0;
  }

  function buildIsCreateClassCallExpression(factoryMethods) {
    const matchMemberExpressions = {};

    factoryMethods.forEach(method => {
      matchMemberExpressions[method] = t.buildMatchMemberExpression(method);
    });

    return node => {
      for (let i = 0; i < factoryMethods.length; i++) {
        const method = factoryMethods[i];
        if (method.indexOf('.') !== -1) {
          if (matchMemberExpressions[method](node.callee)) {
            return true;
          }
        } else {
          if (node.callee.name === method) {
            return true;
          }
        }
      }
    }
  }

  /**
   * Does this node look like a createClass() call?
   */
  function isCreateClass(node, isCreateClassCallExpression) {
    if (!node || !t.isCallExpression(node)) {
      return false;
    }
    if (!isCreateClassCallExpression(node)) {
      return false;
    }
    const args = node.arguments;
    if (args.length !== 1) {
      return false;
    }
    const first = args[0];
    if (!t.isObjectExpression(first)) {
      return false;
    }
    return true;
  }

  /**
   * Infers a displayName from either a class node, or a createClass() call node.
   */
  function findDisplayName(node, parent) {
    if (node.id) {
      return node.id.name;
    }
    if (t.isArrowFunctionExpression(node) && t.isVariableDeclarator(parent)) {
      return parent.id.name;
    }
    if (!node.arguments) {
      return;
    }
    const props = node.arguments[0].properties;
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      const key = t.toComputedKey(prop);
      if (t.isLiteral(key, { value: 'displayName' })) {
        return prop.value.value;
      }
    }
  }

  function isValidOptions(options) {
    return typeof options === 'object' &&
      Array.isArray(options.transforms);
  }

  let didWarnAboutLegacyConfig = false;
  function warnOnceAboutLegacyConfig() {
    if (didWarnAboutLegacyConfig) {
      return;
    }
    console.warn(
      'Warning: you are using an outdated format of React Transform configuration. ' +
      'Please update your configuration to the new format. See the Releases page for migration instructions: ' +
      'https://github.com/gaearon/babel-plugin-react-transform/releases'
    );
    didWarnAboutLegacyConfig = true;
  }

  /**
   * Enforces plugin options to be defined and returns them.
   */
  function getPluginOptions(file) {
    if (!file.opts || !file.opts.extra) {
      return;
    }

    let pluginOptions = file.opts.extra['react-transform'];
    if (Array.isArray(pluginOptions)) {
      warnOnceAboutLegacyConfig();
      const transforms = pluginOptions.map(option => {
        option.transform = option.transform || option.target;
        return option;
      });
      pluginOptions = { transforms };
    }

    if (!isValidOptions(pluginOptions)) {
      throw new Error(
        'babel-plugin-react-transform requires that you specify ' +
        'extras["react-transform"] in .babelrc ' +
        'or in your Babel Node API call options, and that it is an object with ' +
        'a transforms property which is an array.'
      );
    }
    return pluginOptions;
  }

  /**
   * Creates a record about us having visited a valid React component.
   * Such records will later be merged into a single object.
   */
  function createComponentRecord(node, parent, scope, file, state) {
    const displayName = findDisplayName(node, parent) || undefined;
    const uniqueId = scope.generateUidIdentifier(
      '$' + (displayName || 'Unknown')
    ).name;

    let props = [];
    if (typeof displayName === 'string') {
      props.push(t.property('init',
        t.identifier('displayName'),
        t.literal(displayName)
      ));
    }
    if (state[depthKey] > 0) {
      props.push(t.property('init',
        t.identifier('isInFunction'),
        t.literal(true)
      ));
    }
    if (t.isFunction(node)) {
      props.push(t.property('init',
        t.identifier('isFunction'),
        t.literal(true)
      ));
    }

    return [uniqueId, t.objectExpression(props)];
  }

  /**
   * Memorizes the fact that we have visited a valid component in the plugin state.
   * We will later retrieve memorized records to compose an object out of them.
   */
  function addComponentRecord(node, parent, scope, file, state) {
    const [uniqueId, definition] = createComponentRecord(node, parent, scope, file, state);
    state[recordsKey] = state[recordsKey] || [];
    state[recordsKey].push(t.property('init',
      t.identifier(uniqueId),
      definition
    ));
    return uniqueId;
  }

  /**
   * Have we visited any components so far?
   */
  function foundComponentRecords(state) {
    const records = state[recordsKey];
    return records && records.length > 0;
  }

  /**
   * Turns all component records recorded so far, into a variable.
   */
  function defineComponentRecords(scope, state) {
    const records = state[recordsKey];
    state[recordsKey] = [];

    const id = scope.generateUidIdentifier('components');
    return [id, t.variableDeclaration('var', [
      t.variableDeclarator(id, t.objectExpression(records))
    ])];
  }

  /**
   * Imports and calls a particular transformation target function.
   * You may specify several such transformations, so they are handled separately.
   */
  function defineInitTransformCall(scope, file, recordsId, targetOptions) {
    const id = scope.generateUidIdentifier('reactComponentWrapper');
    const { transform, imports = [], locals = [] } = targetOptions;
    const { filename } = file.opts;

    function isSameAsFileBeingProcessed(importPath) {
      const { dir, base, ext, name } = parsePath(resolvePath(importPath, filename));
      return dir === '.' && name === parsePath(filename).name;
    }

    if (imports.some(isSameAsFileBeingProcessed)) {
      return;
    }

    return [id, t.variableDeclaration('var', [
      t.variableDeclarator(id,
        t.callExpression(file.addImport(resolvePath(transform, filename)), [
          t.objectExpression([
            t.property('init', t.identifier('filename'), t.literal(filename)),
            t.property('init', t.identifier('components'), recordsId),
            t.property('init', t.identifier('locals'), t.arrayExpression(
              locals.map(local => t.identifier(local))
            )),
            t.property('init', t.identifier('imports'), t.arrayExpression(
              imports.map(imp => file.addImport(resolvePath(imp, filename), imp, 'absolute'))
            ))
          ])
        ])
      )
    ])];
  }

  /**
   * Defines the function that calls every transform.
   * This is the function every component will be wrapped with.
   */
  function defineWrapComponent(wrapComponentId, initTransformIds) {
    return t.functionDeclaration(wrapComponentId, [t.identifier('uniqueId')],
      t.blockStatement([
        t.returnStatement(
          t.functionExpression(null, [t.identifier('ReactClass')], t.blockStatement([
            t.returnStatement(
              initTransformIds.reduce((composed, initTransformId) =>
                t.callExpression(initTransformId, [composed, t.identifier('uniqueId')]),
                t.identifier('ReactClass')
              )
            )
          ]))
        )
      ])
    );
  }

  return new Plugin('babel-plugin-react-transform', {
    visitor: {
      JSXElement: {
        exit(node, parent, scope, file) {
          if (this.state[depthKey] > 0) {
            this.state[foundJSXKey] = true;
          }
        }
      },

      "FunctionDeclaration|ArrowFunctionExpression": {
        enter(node, parent, scope, file) {
          if (!this.state[depthKey]) {
            this.state[depthKey] = 0;
          }
          this.state[depthKey]++;
        },

        exit(node, parent, scope, file) {
          this.state[depthKey]--;

          if (this.state[depthKey] > 0 || !this.state[foundJSXKey]) {
            return;
          }

          delete this.state[foundJSXKey];

          const wrapReactComponentId = this.state[wrapComponentIdKey];
          const uniqueId = addComponentRecord(node, parent, scope, file, this.state);
          const bindingId = node.id;

          if (t.isArrowFunctionExpression(node) && t.isVariableDeclarator(parent)) {
            return t.callExpression(
              t.callExpression(wrapReactComponentId, [t.literal(uniqueId)]),
              [node]
            );
          }

          return [
            node,
            t.assignmentExpression('=', bindingId,
              t.callExpression(
                t.callExpression(wrapReactComponentId, [t.literal(uniqueId)]),
                [bindingId]
              )
            )
          ];
        }
      },

      Class(node, parent, scope, file) {
        if (!isComponentishClass(node)) {
          return;
        }

        const wrapReactComponentId = this.state[wrapComponentIdKey];
        const uniqueId = addComponentRecord(node, parent, scope, file, this.state);

        node.decorators = node.decorators || [];
        node.decorators.push(t.decorator(
          t.callExpression(wrapReactComponentId, [t.literal(uniqueId)])
        ));
      },

      CallExpression: {
        exit(node, parent, scope, file) {
          const { isCreateClassCallExpression } = this.state[cacheKey];
          if (!isCreateClass(node, isCreateClassCallExpression)) {
            return;
          }

          const wrapReactComponentId = this.state[wrapComponentIdKey];
          const uniqueId = addComponentRecord(node, parent, scope, file, this.state);

          return t.callExpression(
            t.callExpression(wrapReactComponentId, [t.literal(uniqueId)]),
            [node]
          );
        }
      },

      Program: {
        enter(node, parent, scope, file) {
          const options = getPluginOptions(file);
          const factoryMethods = options.factoryMethods || ['React.createClass', 'createClass'];
          this.state[optionsKey] = options;
          this.state[cacheKey] = {
            isCreateClassCallExpression: buildIsCreateClassCallExpression(factoryMethods),
          };

          this.state[wrapComponentIdKey] = scope.generateUidIdentifier('wrapComponent');
        },

        exit(node, parent, scope, file) {
          if (!foundComponentRecords(this.state)) {
            return;
          }

          // Generate a variable holding component records
          const allTransforms = this.state[optionsKey].transforms;
          const [recordsId, recordsVar] = defineComponentRecords(scope, this.state);

          // Import transformation functions and initialize them
          const initTransformCalls = allTransforms.map(transformOptions =>
            defineInitTransformCall(scope, file, recordsId, transformOptions)
          ).filter(Boolean);
          const initTransformIds = initTransformCalls.map(c => c[0]);
          const initTransformVars = initTransformCalls.map(c => c[1]);

          // Create one uber function calling each transformation
          const wrapComponentId = this.state[wrapComponentIdKey];
          const wrapComponent = defineWrapComponent(wrapComponentId, initTransformIds);

          return t.program([
            recordsVar,
            ...initTransformVars,
            wrapComponent,
            ...node.body
          ]);
        }
      }
    }
  });
}
