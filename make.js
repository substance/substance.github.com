const b = require('substance-bundler')
const { generate } = require('substance-pages')
const site = require('./config.json')

generate(b, {
  pages: ['index.html'],
  partials: [
    'includes/*.html',
    'layouts/*.html'
  ],
  out: 'build',
  globals: {
    site
  }
})


  // generate(b, {
  //   pages: 'demo/*.html',
  //   partials: 'demo/partials/*',
  //   out: 'dist/demo',
  //   rootDir: 'demo',
  //   assets: [
  //     'demo/demo.css'
  //   ],
  //   labels: 'demo/labels/en.json',
  //   debug: true
  // })
