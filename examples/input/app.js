(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

var InputNode = (function (DocumentNode$$1) {
  function InputNode () {
    DocumentNode$$1.apply(this, arguments);
  }if ( DocumentNode$$1 ) InputNode.__proto__ = DocumentNode$$1;
  InputNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
  InputNode.prototype.constructor = InputNode;

  

  return InputNode;
}(substance.DocumentNode));

InputNode.defineSchema({
  type: 'input-node',
  content: { type: 'string', default: '' }
});

var InputComponent = (function (Component$$1) {
  function InputComponent () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) InputComponent.__proto__ = Component$$1;
  InputComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
  InputComponent.prototype.constructor = InputComponent;

  InputComponent.prototype.didMount = function didMount () {
    // Register for model side updates
    this.context.editorSession.onRender('document', this.onContentChange, this, {
      path: [this.props.node.id, 'content']
    });
  };

  // And please always deregister
  InputComponent.prototype.dispose = function dispose () {
    this.context.editorSession.off(this);
  };

  InputComponent.prototype.render = function render ($$) {
    var el = $$('div').addClass('sc-input-node');
    var input = $$('input').ref('input')
      .val(this.props.node.content)
      .on('change', this.onChange);
    // you should disable the input when the parent asks you to do so
    if (this.props.disabled) {
      input.attr('disabled', true);
    }

    el.append(input);
    return el
  };

  // this is called when the input's content has been changed
  InputComponent.prototype.onChange = function onChange () {
    var editorSession = this.context.editorSession;
    var node = this.props.node;
    var newVal = this.refs.input.val();
    editorSession.transaction(function(tx) {
      tx.set([node.id, 'content'], newVal);
    });
  };

  // this is called when the model has changed, e.g. on undo/redo
  InputComponent.prototype.onContentChange = function onContentChange () {
    this.refs.input.val(this.props.node.content);
  };

  return InputComponent;
}(substance.Component));

var InputPackage = {
  name: 'input',
  configure: function(config) {
    config.addNode(InputNode);
    config.addComponent(InputNode.type, InputComponent);
    config.addLabel('input', 'Input');
  }
};

var fixture = function(tx) {
  var body = tx.get('body');
  tx.create({
    id: 'title',
    type: 'heading',
    level: 1,
    content: 'Input Element'
  });
  body.show('title');
  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: [
      "You can use custom elements with an HTML input element"
    ].join('')
  });
  body.show('intro');
  tx.create({
    type: 'input-node',
    id: 'input',
    content: 'Lorem ipsum...'
  });
  body.show('input');
  tx.create({
    id: 'the-end',
    type: 'paragraph',
    content: 'That way you can implement editor functionality using class web development practices.'
  });
  body.show('the-end');
};

var cfg = new substance.Configurator();
cfg.import(substance.ProseEditorPackage);
cfg.import(InputPackage);

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