(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

var ExampleFigureNode = (function (BlockNode$$1) {
  function ExampleFigureNode () {
    BlockNode$$1.apply(this, arguments);
  }if ( BlockNode$$1 ) ExampleFigureNode.__proto__ = BlockNode$$1;
  ExampleFigureNode.prototype = Object.create( BlockNode$$1 && BlockNode$$1.prototype );
  ExampleFigureNode.prototype.constructor = ExampleFigureNode;

  

  return ExampleFigureNode;
}(substance.BlockNode));

ExampleFigureNode.type = 'figure';

ExampleFigureNode.schema = {
  url: 'string',
  caption: 'text'
};

var ExampleFigureComponent = (function (Component$$1) {
  function ExampleFigureComponent () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) ExampleFigureComponent.__proto__ = Component$$1;
  ExampleFigureComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
  ExampleFigureComponent.prototype.constructor = ExampleFigureComponent;

  ExampleFigureComponent.prototype.render = function render ($$) {
    var node = this.props.node;
    var el = $$('div').addClass('sc-figure');
    el.append(
      $$('img').ref('image')
        .attr('src', node.url)
        .attr('draggable', true)
    );
    el.append($$(substance.TextPropertyEditor, {
      path: [node.id, 'caption'],
      disabled: this.props.disabled
    }).ref('caption'));
    return el
  };

  return ExampleFigureComponent;
}(substance.Component));

ExampleFigureComponent.noBlocker = true;

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
    id: 'p1',
    type: 'paragraph',
    content: "Below you find all variants of IsolatedNodes."
  });
  body.show('p1');

  tx.create({
    id: 'p2',
    type: 'paragraph',
    content: "A regular IsolatedNode keeps the content blocked unless the user activates it with a double-click. The most prominent example is a Table."
  });
  body.show('p2');

  // row-1
  tx.create({ id: 'tc1', type: 'table-cell', content: "A1:A2", rowspan: 2 });
  tx.create({ id: 'tc2', type: 'table-cell', content: "B1", colspan: 2 });
  // row-2
  tx.create({ id: 'tc3', type: 'table-cell', content: "B2"});
  tx.create({ id: 'tc4', type: 'table-cell', content: "C2"});
  // row-3
  tx.create({ id: 'tc5', type: 'table-cell', content: "A3"});
  tx.create({ id: 'tc6', type: 'table-cell', content: "B3"});
  tx.create({ id: 'tc7', type: 'table-cell', content: "C3"});

  tx.create({
    id: 't1',
    type: 'table',
    // null values mark merged cells
    cells: [
      ['tc1', 'tc2', null ],
      [null, 'tc3', 'tc4'],
      ['tc5', 'tc6', 'tc7']
    ]
  });
  body.show('t1');

  tx.create({
    id: 'p3',
    type: 'paragraph',
    content: "An open IsolatedNode does not shield the content with a blocker. It is more accessible, but a little trickier to implement correctly."
  });
  body.show('p3');

  tx.create({
    id: 'fig1',
    type: 'figure',
    url: './assets/alien.svg',
    caption: 'This is the figure caption'
  });
  body.show('fig1');

  tx.create({
    id: 'p4',
    type: 'paragraph',
    content: "An InlineNode is the last variant. The most prominent example is an InlineImage $."
  });
  body.show('p4');
  tx.create({
    type: 'inline-image',
    id: 'im1',
    src: './assets/smile.png',
    path: ['p4', 'content'],
    startOffset: 80,
    endOffset: 81
  });

};

window.onload = function() {
  var cfg = new substance.ProseEditorConfigurator();

  cfg.import(substance.ProseEditorPackage);
  cfg.import(InlineImagePackage);

  cfg.addNode(ExampleFigureNode);
  cfg.addComponent(ExampleFigureNode.type, ExampleFigureComponent);

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