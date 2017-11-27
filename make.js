const b = require('substance-bundler')
const { generate } = require('substance-pages')
const site = require('./config.json')

b.rm('build')

generate(b, {
  pages: ['index.html'],
  partials: [
    'includes/*.html',
    'layouts/*.html'
  ],
  out: 'build',
  globals: {
    site
  },
})
b.copy('css', 'build/css')
b.copy('js', 'build/js')
b.copy('images', 'build/images')

b.setServerPort(4005)
b.serve({ static: true, route: '/', folder: './build/' })
