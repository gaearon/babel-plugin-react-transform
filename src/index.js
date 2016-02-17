import find from 'array-find';

export default function({ types: t, template }) {
  function findFunctionalIDAndDeclaration(declaration) {
    // Recognize `function Component() { ... }`
    if (t.isFunctionDeclaration(declaration)) {
      return {
        id: declaration.id,
        declaration
      };
    }

    // Recognize:
    //   - `const Component = function() { ... }`
    //   - `const Component = () => { ... }`
    //   - `const Component = () => ( ... )`
    if (
      t.isVariableDeclaration(declaration) &&
      declaration.kind === "const" &&
      declaration.declarations.length === 1
    ) {
      const { id, init } = declaration.declarations[0];

      if (
        t.isIdentifier(id) &&
        (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init))
      ) {
        return {
          id,
          declaration: init
        };
      }
    }

    return {};
  }

  function functionalParamToVariable(param, i) {
    if (t.isIdentifier(param)) {
      const { name } = param;

      // `(props, context) => {...}` becomes:
      //   - `const props = this.props`
      //   - `const context = this.context`
      return t.variableDeclaration(
        "const",
        [
          t.variableDeclarator(
            t.identifier(name),
            t.memberExpression(t.thisExpression(), t.identifier(i === 0 ? "props" : "context"))
          )
        ]
      );
    }

    // `({ children }, { router }) => {...}` becomes
    //   0. `const { children } = this.props`
    //   1. `const { router } = this.context`
    if (t.isObjectPattern(param)) {
      return t.variableDeclaration(
        "const",
        [
          t.variableDeclarator(
            param,
            t.memberExpression(
              t.thisExpression(),
              t.identifier(i === 0 ? "props" : "context")
            )
          )
        ]
      );
    }
  }

  function functionalToClass(id, declaration) {
    // Insert React into scope if it hasn't been imported yet
    if (!this.file.scope.references.React) {
      this.file.path.node.body.unshift(t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier("React"))],
        t.stringLiteral("react")
      ));
    }

    // Functional components explicitly extend React.Component
    const superClass = t.memberExpression(
      t.identifier("React"),
      t.identifier("Component")
    );

    // Support both:
    //   - `function() { return ...; }`
    //   - `() => ( ... )`;
    const renderBody = t.isBlockStatement(declaration.body)
      ? declaration.body.body
      : [t.returnStatement(declaration.body)];

    // Convert function arguments to explicit variables
    const variables = declaration.params.map(functionalParamToVariable);

    // render() arguments
    const args = [];

    const body = t.classBody([
      t.classMethod(
        "method",
        t.identifier("render"),
        args,
        t.blockStatement([
          ...variables,
          ...renderBody
        ])
      )
    ]);

    // Class decorators
    const decorators = [];

    return t.classDeclaration(
      id,
      superClass,
      body,
      decorators
    );
  }

  function matchesPatterns(path, patterns) {
    return !!find(patterns, pattern => {
      return (
        t.isIdentifier(path.node, { name: pattern }) ||
        path.matchesPattern(pattern)
      );
    });
  }

  function isReactLikeClass(node) {
    return !!find(node.body.body, classMember => {
      return (
        t.isClassMethod(classMember) &&
        t.isIdentifier(classMember.key, { name: 'render' })
      );
    });
  }

  function isReactLikeComponentObject(node) {
    return t.isObjectExpression(node) && !!find(node.properties, objectMember => {
      return (
        t.isObjectProperty(objectMember) ||
        t.isObjectMethod(objectMember)
      ) && (
        t.isIdentifier(objectMember.key, { name: 'render' }) ||
        t.isStringLiteral(objectMember.key, { value: 'render' })
      );
    });
  }

  function isReactLikeFunction(node) {
    // Support `{ ... } ` that returns JSX
    if (t.isBlockStatement(node.body)) {
      return !!find(node.body.body, statement => {
        return (
          t.isReturnStatement(statement) &&
          t.isJSXElement(statement.argument)
        );
      });
    }

    // Support Arrow Expressions without { ... }
    if (
      t.isArrowFunctionExpression(node) &&
      t.isJSXElement(node.body)
    ) {
      return true;
    }

    return false;
  }

  function isReactLikeID(id) {
    return id && id.name.match(/^[A-Z]\w+$/);
  }

  // `foo({ displayName: 'NAME' });` => 'NAME'
  function getDisplayName(node) {
    const property = find(node.arguments[0].properties, node => node.key.name === 'displayName');
    return property && property.value.value;
  }

  function hasParentFunction(path) {
    return !!path.findParent(parentPath => parentPath.isFunction());
  }

  // wrapperFunction("componentId")(node)
  function wrapComponent(node, componentId, wrapperFunctionId) {
    return t.callExpression(
      t.callExpression(wrapperFunctionId, [
        t.stringLiteral(componentId)
      ]),
      [node]
    );
  }

  // `{ name: foo }` => Node { type: "ObjectExpression", properties: [...] }
  function toObjectExpression(object) {
    const properties = Object.keys(object).map(key => {
      return t.objectProperty(t.identifier(key), object[key]);
    });

    return t.objectExpression(properties);
  }

  const wrapperFunctionTemplate = template(`
    function WRAPPER_FUNCTION_ID(ID_PARAM) {
      return function(COMPONENT_PARAM) {
        return EXPRESSION;
      };
    }
  `);

  const VISITED_KEY = 'react-transform-' + Date.now();

  const componentVisitor = {
    Class(path) {
      if (
        path.node[VISITED_KEY] ||
        !matchesPatterns(path.get('superClass'), this.superClasses) &&
        !isReactLikeClass(path.node)
      ) {
        return;
      }

      path.node[VISITED_KEY] = true;

      const componentName = path.node.id && path.node.id.name || null;
      const componentId = componentName || path.scope.generateUid('component');
      const isInFunction = hasParentFunction(path);

      this.components.push({
        id: componentId,
        name: componentName,
        isInFunction: isInFunction
      });

      // Can't wrap ClassDeclarations
      const isStatement = t.isStatement(path.node);
      const expression = t.toExpression(path.node);

      // wrapperFunction("componentId")(node)
      let wrapped = wrapComponent(expression, componentId, this.wrapperFunctionId);
      let constId;

      if (isStatement) {
        // wrapperFunction("componentId")(class Foo ...) => const Foo = wrapperFunction("componentId")(class Foo ...)
        constId = t.identifier(componentName || componentId);
        wrapped = t.variableDeclaration('const', [
          t.variableDeclarator(constId, wrapped)
        ]);
      }

      if (t.isExportDefaultDeclaration(path.parent)) {
        path.parentPath.insertBefore(wrapped);
        path.parent.declaration = constId;
      } else {
        path.replaceWith(wrapped);
      }
    },

    CallExpression(path) {
      if (
        path.node[VISITED_KEY] ||
        !matchesPatterns(path.get('callee'), this.factoryMethods) &&
        !isReactLikeComponentObject(path.node.arguments[0])
      ) {
        return;
      }

      path.node[VISITED_KEY] = true;

      // `foo({ displayName: 'NAME' });` => 'NAME'
      const componentName = getDisplayName(path.node);
      const componentId = componentName || path.scope.generateUid('component');
      const isInFunction = hasParentFunction(path);

      this.components.push({
        id: componentId,
        name: componentName,
        isInFunction: isInFunction
      });

      path.replaceWith(
        wrapComponent(path.node, componentId, this.wrapperFunctionId)
      );
    }
  };

  const functionalVisitor = {
    ExportDefaultDeclaration(path) {
      const { id, declaration } = findFunctionalIDAndDeclaration(path.node.declaration);

      if (
        !id ||
        !declaration ||
        path.node[VISITED_KEY] ||
        !isReactLikeID(id) ||
        !isReactLikeFunction(declaration)
      ) {
        return;
      }

      path.node[VISITED_KEY] = true;

      const Component = functionalToClass.bind(this)(id, declaration);

      path.replaceWith(Component);
      path.insertAfter(t.exportDefaultDeclaration(Component.id));
    },

    ExportNamedDeclaration(path) {
      const { id, declaration } = findFunctionalIDAndDeclaration(path.node.declaration);

      if (
        !id ||
        !declaration ||
        path.node[VISITED_KEY] ||
        !isReactLikeID(id) ||
        !isReactLikeFunction(declaration)
      ) {
        return;
      }

      path.node[VISITED_KEY] = true;

      const Component = functionalToClass.bind(this)(id, declaration);

      path.replaceWith(Component);
    },

    FunctionDeclaration(path) {
      // Only recognize top-level functional components
      if (!t.isProgram(path.parentPath)) {
        return;
      }

      const { id, declaration } = findFunctionalIDAndDeclaration(path.node);

      if (
        !id ||
        !declaration ||
        path.node[VISITED_KEY] ||
        !isReactLikeID(id) ||
        !isReactLikeFunction(declaration)
      ) {
        return;
      }

      path.node[VISITED_KEY] = true;

      const Component = functionalToClass.bind(this)(id, declaration);

      path.replaceWith(Component);
    },

    VariableDeclaration(path) {
      // Only recognize top-level function assignments
      if (!t.isProgram(path.parentPath)) {
        return;
      }

      const { id, declaration } = findFunctionalIDAndDeclaration(path.node);

      if (
        !id ||
        !declaration ||
        path.node[VISITED_KEY] ||
        !isReactLikeID(id) ||
        !isReactLikeFunction(declaration)
      ) {
        return;
      }

      path.node[VISITED_KEY] = true;

      const Component = functionalToClass.bind(this)(id, declaration);

      path.replaceWith(Component);
    }
  };

  class ReactTransformBuilder {
    constructor(file, options) {
      this.file = file;
      this.program = file.path;
      this.options = this.normalizeOptions(options);

      // @todo: clean this shit up
      this.configuredTransformsIds = [];
    }

    static validateOptions(options) {
      return typeof options === 'object' && Array.isArray(options.transforms);
    }

    static assertValidOptions(options) {
      if (!ReactTransformBuilder.validateOptions(options)) {
        throw new Error(
          'babel-plugin-react-transform requires that you specify options ' +
          'in .babelrc or from the Babel Node API, and that it is an object ' +
          'with a transforms property which is an array.'
        );
      }
    }

    normalizeOptions(options) {
      return {
        factoryMethods: options.factoryMethods || ['React.createClass'],
        superClasses: options.superClasses || ['React.Component'],
        transforms: options.transforms.map(opts => {
          return {
            transform: opts.transform,
            locals: opts.locals || [],
            imports: opts.imports || []
          };
        }),
        transformReactLikeFunctionsToClasses: typeof options.transformReactLikeFunctionsToClasses !== "undefined"
          ? options.transformReactLikeFunctionsToClasses
          : false
      };
    }

    build() {
      const componentsDeclarationId = this.file.scope.generateUidIdentifier('components');
      const wrapperFunctionId = this.file.scope.generateUidIdentifier('wrapComponent');

      if (this.options.transformReactLikeFunctionsToClasses) {
        this.transformFunctionalComponents();
      }

      const components = this.collectAndWrapComponents(wrapperFunctionId);

      if (!components.length) {
        return;
      }

      const componentsDeclaration = this.initComponentsDeclaration(componentsDeclarationId, components);
      const configuredTransforms = this.initTransformers(componentsDeclarationId);
      const wrapperFunction = this.initWrapperFunction(wrapperFunctionId);

      const body = this.program.node.body;

      body.unshift(wrapperFunction);
      configuredTransforms.reverse().forEach(node => body.unshift(node));
      body.unshift(componentsDeclaration);
    }

    /**
     * const Foo = _wrapComponent('Foo')(class Foo extends React.Component {});
     * ...
     * const Bar = _wrapComponent('Bar')(React.createClass({
     *   displayName: 'Bar'
     * }));
     */
    collectAndWrapComponents(wrapperFunctionId) {
      const components = [];

      this.file.path.traverse(componentVisitor, {
        wrapperFunctionId: wrapperFunctionId,
        components: components,
        factoryMethods: this.options.factoryMethods,
        superClasses: this.options.superClasses,
        currentlyInFunction: false
      });

      return components;
    }

    /**
     * const _components = {
     *   Foo: {
     *     displayName: "Foo"
     *   }
     * };
     */
    initComponentsDeclaration(componentsDeclarationId, components) {
      let uniqueId = 0;

      const props = components.map(component => {
        const componentId = component.id;
        const componentProps = [];

        if (component.name) {
          componentProps.push(t.objectProperty(
            t.identifier('displayName'),
            t.stringLiteral(component.name)
          ));
        }

        if (component.isInFunction) {
          componentProps.push(t.objectProperty(
            t.identifier('isInFunction'),
            t.booleanLiteral(true)
          ));
        }

        let objectKey;

        if (t.isValidIdentifier(componentId)) {
          objectKey = t.identifier(componentId);
        } else {
          objectKey = t.stringLiteral(componentId);
        }

        return t.objectProperty(objectKey, t.objectExpression(componentProps));
      });

      return t.variableDeclaration('const', [
        t.variableDeclarator(componentsDeclarationId, t.objectExpression(props))
      ]);
    }

    /**
     * import _transformLib from "transform-lib";
     * ...
     * const _transformLib2 = _transformLib({
     *   filename: "filename",
     *   components: _components,
     *   locals: [],
     *   imports: []
     * });
     */
    initTransformers(componentsDeclarationId) {
      return this.options.transforms.map(transform => {
        const transformName = transform.transform;
        const transformImportId = this.file.addImport(transformName, 'default', transformName);

        const transformLocals = transform.locals.map(local => {
          return t.identifier(local);
        });

        const transformImports = transform.imports.map(importName => {
          return this.file.addImport(importName, 'default', importName);
        });

        const configuredTransformId = this.file.scope.generateUidIdentifier(transformName);
        const configuredTransform = t.variableDeclaration('const', [
          t.variableDeclarator(
            configuredTransformId,
            t.callExpression(transformImportId, [
              toObjectExpression({
                filename: t.stringLiteral(this.file.opts.filename),
                components: componentsDeclarationId,
                locals: t.arrayExpression(transformLocals),
                imports: t.arrayExpression(transformImports)
              })
            ])
          )
        ]);

        this.configuredTransformsIds.push(configuredTransformId);

        return configuredTransform;
      });
    }

    /**
     * function _wrapComponent(id) {
     *   return function (Component) {
     *     return _transformLib2(Component, id);
     *   };
     * }
     */
    initWrapperFunction(wrapperFunctionId) {
      const idParam = t.identifier('id');
      const componentParam = t.identifier('Component');

      const expression = this.configuredTransformsIds.reverse().reduce((memo, transformId) => {
        return t.callExpression(transformId, [memo, idParam]);
      }, componentParam);

      return wrapperFunctionTemplate({
        WRAPPER_FUNCTION_ID: wrapperFunctionId,
        ID_PARAM: idParam,
        COMPONENT_PARAM: componentParam,
        EXPRESSION: expression
      });
    }

    /**
     * Convert pure, stateless functional components
     * into React.Components to be wrapped.
     */
    transformFunctionalComponents() {
      this.file.path.traverse(functionalVisitor, {
        file: this.file,
        superClasses: this.options.superClasses
      });
    }
  }

  return {
    visitor: {
      Program(path, { file, opts }) {
        ReactTransformBuilder.assertValidOptions(opts);
        const builder = new ReactTransformBuilder(file, opts);
        builder.build();
      }
    }
  };
}
