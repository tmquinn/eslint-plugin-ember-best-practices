const rule = require('../../../lib/rules/no-broken-super-chain');
const RuleTester = require('eslint').RuleTester;

const { noSuper, noThisBeforeSuper, tooManySupers } = rule.meta.messages;
const ruleTester = new RuleTester();

ruleTester.run('no-broken-super-chain', rule, {
  valid: [
    {
      code: `
        export default Ember.Component({
          init() {
            this._super(...arguments);
            this.alias = this.concrete;
          },
          somethingNotInit() {
            this.alias = this.concrete;
          }

        });`,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      }
    },
    {
      code: `
        export default Ember.Component({
          somethingNotInit() {
            this._super(...arguments);
            this.alias = this.concrete;
          }
        });`,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      }
    }
  ],
  invalid: [
    {
      code: `
        export default Ember.Component({
          init() {
            this.alias = this.concrete;
          }
        });`,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      },
      errors: [{
        message: noSuper
      }]
    },
    {
      code: `
        export default Ember.Component({
          init() {
            this.alias = this.concrete;
            this._super(...arguments);
          }
        });`,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      },
      errors: [{
        message: noThisBeforeSuper
      }]
    },
    {
      code: `
        export default Ember.Component({
          init() {
            this._super(...arguments);
            this.alias = this.concrete;
            this._super(...arguments);
          }
        });`,
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      },
      errors: [{
        message: tooManySupers
      }]
    }

  ]
});