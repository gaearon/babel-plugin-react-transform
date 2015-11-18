import template from 'babel-template';

const buildWrappedClass = template(`
  (function(){ var CLASS_REF = CLASS; return DECORATOR(CLASS_REF) || CLASS_REF; })()
`);

export default function ({ types: t }) {
  const depthKey = '__reactTransformDepth';
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
    return t.isObjectExpression(first);
  }

  /**
   * Infers a displayName from either a class node, or a createClass() call node.
   */
  function findDisplayName(node) {
    if (node.id) {
      return node.id.name;
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

  /**
   * Creates a record about us having visited a valid React component.
   * Such records will later be merged into a single object.
   */
  function createComponentRecord(node, scope, state) {
    const displayName = findDisplayName(node) || undefined;
    const uniqueId = scope.generateUidIdentifier(
      '$' + (displayName || 'Unknown')
    ).name;

    let props = [];
    if (typeof displayName === 'string') {
      props.push(t.objectProperty(
        t.identifier('displayName'),
        t.stringLiteral(displayName)
      ));
    }
    if (state[depthKey] > 0) {
      props.push(t.objectProperty(
        t.identifier('isInFunction'),
        t.booleanLiteral(true)
      ));
    }

    return [uniqueId, t.objectExpression(props)];
  }

  /**
   * Memorizes the fact that we have visited a valid component in the plugin state.
   * We will later retrieve memorized records to compose an object out of them.
   */
  function addComponentRecord(node, scope, state) {
    const [uniqueId, definition] = createComponentRecord(node, scope, state);
    state[recordsKey] = state[recordsKey] || [];
    state[recordsKey].push(t.objectProperty(
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
    return [id, t.variableDeclaration('var', [
      t.variableDeclarator(id,
        t.callExpression(file.addImport(transform, 'default'), [
          t.objectExpression([
            t.objectProperty(t.identifier('filename'), t.stringLiteral(filename)),
            t.objectProperty(t.identifier('components'), recordsId),
            t.objectProperty(t.identifier('locals'), t.arrayExpression(
              locals.map(local => t.identifier(local))
            )),
            t.objectProperty(t.identifier('imports'), t.arrayExpression(
              imports.map(imp => file.addImport(imp, 'default', 'absolute'))
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

  return {
    visitor: {
      'FunctionDeclaration|FunctionExpression': {
        enter({ node, parent, scope }) {
          if (!this.state[depthKey]) {
            this.state[depthKey] = 0;
          }
          this.state[depthKey]++;
        },
        exit({ node, parent, scope }) {
          this.state[depthKey]--;
        }
      },

      ClassExpression(path) {
        const {node, scope} = path;
        if (!isComponentishClass(node) || node._reactTransformWrapped) {
          return;
        }

        const wrapReactComponentId = this.state[wrapComponentIdKey];
        const uniqueId = addComponentRecord(node, scope, this.state);
        node._reactTransformWrapped = true;
        const ref = scope.generateUidIdentifierBasedOnNode(node.id);

        path.replaceWith(
          buildWrappedClass({
            CLASS: node,
            CLASS_REF: ref,
            DECORATOR: t.callExpression(wrapReactComponentId, [t.stringLiteral(uniqueId)]),
          })
        );
      },

      CallExpression: {
        exit(path) {
          const { node, scope } = path;
          const { isCreateClassCallExpression } = this.state[cacheKey];
          if (!isCreateClass(node, isCreateClassCallExpression) || node._reactTransformWrapped) {
            return;
          }

          const wrapReactComponentId = this.state[wrapComponentIdKey];
          const uniqueId = addComponentRecord(node, scope, this.state);
          node._reactTransformWrapped = true;

          path.replaceWith(
            t.callExpression(
              t.callExpression(wrapReactComponentId, [t.stringLiteral(uniqueId)]),
              [node]
            )
          );
        }
      },

      Program: {
        enter({ scope }, state) {
          const { opts } = state;
          if (!isValidOptions(opts)) {
            throw new Error(
              'babel-plugin-react-transform requires that you specify options in .babelrc ' +
              'or in your Babel Node API call options, and that it is an object with ' +
              'a transforms property which is an array.'
            );
          }
          const factoryMethods = opts.factoryMethods || ['React.createClass', 'createClass'];

          this.state = {};
          this.state[optionsKey] = opts;
          this.state[cacheKey] = {
            isCreateClassCallExpression: buildIsCreateClassCallExpression(factoryMethods),
          };

          this.state[wrapComponentIdKey] = scope.generateUidIdentifier('wrapComponent');
        },

        exit(path) {
          const { node, scope, hub: {file} } = path;
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
          path.replaceWith(t.program([
            recordsVar,
            ...initTransformVars,
            wrapComponent,
            ...node.body
          ]));
        }
      }
    }
  };
}
