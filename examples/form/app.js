(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

/*
  Node definition
*/
var EntityNode = (function (DocumentNode$$1) {
  function EntityNode () {
    DocumentNode$$1.apply(this, arguments);
  }if ( DocumentNode$$1 ) EntityNode.__proto__ = DocumentNode$$1;
  EntityNode.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
  EntityNode.prototype.constructor = EntityNode;

  

  return EntityNode;
}(substance.DocumentNode));

EntityNode.define({
  type: 'entity',
  name: 'text',
  description: 'text'
});

/*
  Node display component
*/
var EntityComponent = (function (BlockNodeComponent$$1) {
  function EntityComponent () {
    BlockNodeComponent$$1.apply(this, arguments);
  }

  if ( BlockNodeComponent$$1 ) EntityComponent.__proto__ = BlockNodeComponent$$1;
  EntityComponent.prototype = Object.create( BlockNodeComponent$$1 && BlockNodeComponent$$1.prototype );
  EntityComponent.prototype.constructor = EntityComponent;

  EntityComponent.prototype.render = function render ($$) {
    var el = $$('div').addClass('sc-entity');

    el.append(
      $$('div').ref('title').addClass('se-title').append('Entity')
    );

    var table = $$('table');
    table.append(
      $$('colgroup').append(
        $$('col').addClass('se-label-col'),
        $$('col').addClass('se-value-col')
      )
    );

    var nameRow = $$('tr');
    nameRow.append($$('td').addClass('se-label').append('Name:'));
    nameRow.append($$('td').addClass('se-value').append(
      $$(substance.TextPropertyEditor, {
        path: [this.props.node.id, 'name'],
        disabled: this.props.disabled
      }).ref('nameEditor')
    ));
    table.append(nameRow);
    table.append($$('tr').addClass('se-separator'));

    var descriptionRow = $$('tr');
    descriptionRow.append($$('td').addClass('se-label').append('Description:'));
    descriptionRow.append($$('td').addClass('se-value').append(
      $$(substance.TextPropertyEditor, {
        path: [this.props.node.id, 'description'],
        disabled: this.props.disabled
      }).ref('descriptionEditor')
    ));
    table.append(descriptionRow);
    el.append(table);
    return el
  };

  return EntityComponent;
}(substance.BlockNodeComponent));

/*
  Package definition of your plugin
*/
var EntityPackage = {
  name: 'entity',
  configure: function(config) {
    config.addNode(EntityNode);
    config.addComponent(EntityNode.type, EntityComponent);
    config.addLabel('entity', 'Entity');
    config.addLabel('entity.name', 'Name');
    config.addLabel('entity.description', 'Description');
  }
};

/*
  Example document
*/
var fixture = function(tx) {
  var body = tx.get('body');
  tx.create({
    id: 'title',
    type: 'heading',
    level: 1,
    content: 'Embedded Forms'
  });
  body.show('title');
  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: [
      "It is very easy to add a node with a form editing interface.",
      "For example this is very useful to create meta-data editors."
    ].join(' ')
  });
  body.show('intro');
  tx.create({
    type: 'entity',
    id: 'entity',
    name: 'Foo',
    description: 'Bar'
  });
  body.show('entity');
  tx.create({
    id: 'the-end',
    type: 'paragraph',
    content: "That's it."
  });
  body.show('the-end');
};

/*
  Application
*/
var cfg = new substance.ProseEditorConfigurator();
cfg.import(substance.ProseEditorPackage);
cfg.import(EntityPackage);

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