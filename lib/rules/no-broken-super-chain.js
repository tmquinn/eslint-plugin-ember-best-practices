/**
 * @fileOverview Prevent the absence of this._super() in init() calls or the use of this prior to this._super()
 * @author Quinn C Hoyer
 */

const MESSAGES = {
  noSuper: 'this._super(...arguments) must be called in init',
  noThisBeforeSuper: 'you must call this._super(...arguments) before accessing `this`',
  tooManySupers: 'you can only call this._super(...arguments) per init()'
};

let initOverride = null;

module.exports = {
  meta: {
    docs: {
      description: 'Prevent the absence of `this._super(...arguments)` in `init()` calls or the use of `this` prior to `this._super()`',
      category: 'Best Practices',
      recommended: true
    },
    messages: MESSAGES
  },
  create(context) {
    return {
      onCodePathStart(codePath, node) {
        if (node.type === 'FunctionExpression' && node.parent.kind === 'init') {
          initOverride = {
            superCalled: false,
            superCalledFirst: false
          };
        }
      },
      onCodePathEnd(codePath, node) {
        if (node.type === 'FunctionExpression' && node.parent && node.parent.key && node.parent.key.name === 'init') {
          if (!initOverride.superCalled) {
            context.report({
              message: MESSAGES.noSuper,
              node
            });
          }

          initOverride = null;
        }
        return;
      },
      'CallExpression:exit'(node) {
        if (initOverride) {
          const property = node.callee.property;
          if (property && property.type === 'Identifier' && property.name === '_super') {
            if (initOverride.superCalled) {
              // error too many supers
              context.report({
                message: MESSAGES.tooManySupers,
                node
              });
            } else {
              initOverride.superCalled = true;
            }
          }
        }
      },
      'Program:exit'() {
        initOverride = null;
      }
    };
  }
};