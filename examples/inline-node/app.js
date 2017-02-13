(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

var InlineImage = (function (InlineNode$$1) {
  function InlineImage () {
    InlineNode$$1.apply(this, arguments);
  }if ( InlineNode$$1 ) InlineImage.__proto__ = InlineNode$$1;
  InlineImage.prototype = Object.create( InlineNode$$1 && InlineNode$$1.prototype );
  InlineImage.prototype.constructor = InlineImage;

  

  return InlineImage;
}(substance.InlineNode));

InlineImage.type = 'inline-image';
InlineImage.schema = {
  src: { type: 'string', 'default': './assets/smile.png'}
};

var InlineImageComponent = (function (Component$$1) {
  function InlineImageComponent () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) InlineImageComponent.__proto__ = Component$$1;
  InlineImageComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
  InlineImageComponent.prototype.constructor = InlineImageComponent;

  InlineImageComponent.prototype.didMount = function didMount () {
    this.context.editorSession.onRender('document', this.rerender, this, {
      path: [this.props.node.id, 'src']
    });
  };

  InlineImageComponent.prototype.dispose = function dispose () {
    this.context.editorSession.off(this);
  };

  InlineImageComponent.prototype.render = function render ($$) {
    var el = $$('img')
      .attr('src', this.props.node.src)
      .addClass('sc-inline-image');
    return el;
  };

  return InlineImageComponent;
}(substance.Component));

/*
  Edit the src of an existing inline image
*/
var EditInlineImageTool = (function (Tool$$1) {
  function EditInlineImageTool () {
    Tool$$1.apply(this, arguments);
  }

  if ( Tool$$1 ) EditInlineImageTool.__proto__ = Tool$$1;
  EditInlineImageTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
  EditInlineImageTool.prototype.constructor = EditInlineImageTool;

  EditInlineImageTool.prototype.getUrlPath = function getUrlPath () {
    var propPath = this.constructor.urlPropertyPath;
    return [this.props.node.id].concat(propPath)
  };

  EditInlineImageTool.prototype.render = function render ($$) {
    var Input = this.getComponent('input');
    var Button = this.getComponent('button');
    var el = $$('div').addClass('sc-edit-link-tool');
    var urlPath = this.getUrlPath();

    el.append(
      $$(Input, {
        type: 'url',
        path: urlPath,
        placeholder: 'Paste or type an image url'
      }),
      $$(Button, {
        icon: 'delete',
        style: this.props.style
      }).on('click', this.onDelete)
    );
    return el
  };

  EditInlineImageTool.prototype.onDelete = function onDelete () {
    var editorSession = this.context.editorSession;
    editorSession.transaction(function(tx) {
      tx.deleteSelection();
    });
  };

  return EditInlineImageTool;
}(substance.Tool));

EditInlineImageTool.urlPropertyPath = ['src'];

/*
  Package definition of your inline image plugin
*/
var InlineImagePackage = {
  name: 'inline-image',
  configure: function(config) {
    config.addNode(InlineImage);
    config.addComponent(InlineImage.type, InlineImageComponent);
    config.addCommand('add-inline-image', substance.InsertInlineNodeCommand, {nodeType: InlineImage.type});
    config.addCommand('edit-inline-image', substance.EditInlineNodeCommand, {nodeType: InlineImage.type});
    config.addTool('add-inline-image', substance.AnnotationTool, { toolGroup: 'insert'});
    config.addTool('edit-inline-image', EditInlineImageTool, { toolGroup: 'overlay' });
    config.addIcon('add-inline-image', { 'fontawesome': 'fa-image' });
    config.addLabel('add-inline-image', 'Inline Image');
  }
};

var fixture = function(tx) {
  var body = tx.get('body');
  tx.create({
    id: 'title',
    type: 'heading',
    level: 1,
    content: 'Inline Nodes'
  });
  body.show('title');
  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: "This shows an inline image $, which behaves like a character in the text."
  });
  body.show('intro');
  tx.create({
    type: 'inline-image',
    id: 'i1',
    path: ['intro', 'content'],
    startOffset: 27,
    endOffset: 28
  });
  tx.create({
    id: 'the-end',
    type: 'paragraph',
    content: "Yours, Michael $, Oliver $, Daniel $."
  });
  tx.create({
    type: 'inline-image',
    id: 'i2',
    src: './assets/michael.jpg',
    path: ['the-end', 'content'],
    startOffset: 15,
    endOffset: 16
  });
  tx.create({
    type: 'inline-image',
    id: 'i3',
    src: './assets/oliver.jpg',
    path: ['the-end', 'content'],
    startOffset: 25,
    endOffset: 26
  });
  tx.create({
    type: 'inline-image',
    id: 'i4',
    src: './assets/daniel.jpg',
    path: ['the-end', 'content'],
    startOffset: 35,
    endOffset: 36
  });
  body.show('the-end');
};

substance.substanceGlobals.DEBUG_RENDERING = true;


window.onload = function() {
  var cfg = new substance.ProseEditorConfigurator();
  cfg.import(substance.ProseEditorPackage);
  cfg.import(InlineImagePackage);

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