const b = require('substance-bundler')
const { generate } = require('substance-pages')
const site = require('./config.json')

b.rm('build')

generate(b, {
  pages: [
    'index.html',
    'consortium/index.html',
    'privacy/index.html',
    'texture/index.html',
    'tos/index.html'
  ],
  partials: [
    'includes/*.html',
    'layouts/*.html'
  ],
  out: 'build',
  globals: {
    site
  },
})
// assets
b.copy('css', 'build/css')
b.copy('js', 'build/js')
b.copy('images', 'build/images')
// other
b.copy('composer', 'build/composer')
b.copy('lens-writer', 'build/lens-writer')
// TODO: things that should be generated
b.copy('examples', 'build/examples')
b.copy('forms', 'build/forms')

b.setServerPort(4005)
b.serve({ static: true, route: '/', folder: './build/' })
