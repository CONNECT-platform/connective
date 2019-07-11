export default {
  input: 'dist/es6/index.js',
  output: {
    name: 'connective',
    format: 'iife',
    globals: {
      'rxjs': 'rxjs',
      'rxjs/operators': 'rxjs.operators',
      'lodash.isequal': '_.isEqual',
    }
  },
  external: ['rxjs', 'rxjs/operators', 'lodash.isequal'],
}
