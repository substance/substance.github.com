(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

/*
  Example document
*/
var fixture = function(tx) {
  var body = tx.get('body');
  tx.create({
    id: 'p1',
    type: 'paragraph',
    content: "Type # followed by a space to create a heading!"
  });
  body.show('p1');
  tx.create({
    id: 'p2',
    type: 'paragraph',
    content: ""
  });
  body.show('p2');
};

/*
  Application
*/

var cfg = new substance.ProseEditorConfigurator();
cfg.import(substance.ProseEditorPackage);
cfg.addMacro(substance.HeadingMacro);

window.onload = function() {
  var doc = cfg.createArticle(fixture);
  var editorSession = new substance.EditorSession(doc, {
    configurator: cfg
  });
  substance.ProseEditor.mount({
    editorSession: editorSession
  }, document.body);
};

})));

//# sourceMappingURL=./app.js.map