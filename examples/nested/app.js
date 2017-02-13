(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

var fixture = function(tx) {
  var body = tx.get('body');

  tx.create({
    id: 'title',
    type: 'heading',
    level: 1,
    content: 'Nested Elements'
  });
  body.show('title');

  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: [
      "The concept of Isolated Nodes allows to create nested content."
    ].join(' ')
  });
  body.show('intro');

  var c1 = tx.create({
    type: 'container',
    id: 'c1',
    nodes: []
  });
  body.show('c1');

  tx.create({
    type: 'paragraph',
    id: 'c1_p1',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  });
  c1.show('c1_p1');

  var c2 = tx.create({
    type: 'container',
    id: 'c2',
    nodes: []
  });
  c1.show('c2');

  tx.create({
    type: 'paragraph',
    id: 'c2_p1',
    content: 'Nunc turpis erat, sodales id aliquet eget, rutrum vel libero.'
  });
  c2.show('c2_p1');

  tx.create({
    type: 'paragraph',
    id: 'c1_p2',
    content: 'Donec dapibus vel leo sit amet auctor. Curabitur at diam urna.'
  });
  c1.show('c1_p2');

  tx.create({
    id: 'the-end',
    type: 'paragraph',
    content: [
      "That's it."
    ].join('')
  });
  body.show('the-end');
};

var ContainerComponent = (function (Component$$1) {
  function ContainerComponent () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) ContainerComponent.__proto__ = Component$$1;
  ContainerComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
  ContainerComponent.prototype.constructor = ContainerComponent;

  ContainerComponent.prototype.render = function render ($$) {
    var el = $$('div').addClass('sc-container');
    el.append(
      $$(substance.ContainerEditor, {
        node: this.props.node
      }).ref('editor')
    );
    return el
  };

  return ContainerComponent;
}(substance.Component));

ContainerComponent.fullWidth = true;

var InsertContainerCommand = (function (InsertNodeCommand$$1) {
  function InsertContainerCommand () {
    InsertNodeCommand$$1.apply(this, arguments);
  }

  if ( InsertNodeCommand$$1 ) InsertContainerCommand.__proto__ = InsertNodeCommand$$1;
  InsertContainerCommand.prototype = Object.create( InsertNodeCommand$$1 && InsertNodeCommand$$1.prototype );
  InsertContainerCommand.prototype.constructor = InsertContainerCommand;

  InsertContainerCommand.prototype.createNodeData = function createNodeData (tx) {
    var p = tx.createDefaultTextNode('Lorem ipsum.');
    return {
      type: 'container',
      nodes: [p.id]
    }
  };

  return InsertContainerCommand;
}(substance.InsertNodeCommand));

var ContainerPackage = {
  name: 'container',
  configure: function(config) {
    config.addComponent('container', ContainerComponent);
    config.addCommand('insert-container', InsertContainerCommand);
    config.addTool('insert-container', substance.Tool);
    config.addIcon('insert-container', { 'fontawesome': 'fa-align-justify' });
  }
};

var cfg = new substance.ProseEditorConfigurator();
cfg.import(substance.ProseEditorPackage);
cfg.import(ContainerPackage);

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