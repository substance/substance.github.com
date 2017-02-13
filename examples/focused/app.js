(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

/*
  Node definition
*/

var Alien = (function (DocumentNode$$1) {
  function Alien () {
    DocumentNode$$1.apply(this, arguments);
  }if ( DocumentNode$$1 ) Alien.__proto__ = DocumentNode$$1;
  Alien.prototype = Object.create( DocumentNode$$1 && DocumentNode$$1.prototype );
  Alien.prototype.constructor = Alien;

  

  return Alien;
}(substance.DocumentNode));

Alien.define({
  type: 'alien',
  mood: { type: 'string', default: 'normal' }
});

var _moods = ['normal', 'angry', 'excited', 'sad', 'sick'];

/*
  Node display component
*/
var AlienComponent = (function (Component$$1) {
  function AlienComponent () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) AlienComponent.__proto__ = Component$$1;
  AlienComponent.prototype = Object.create( Component$$1 && Component$$1.prototype );
  AlienComponent.prototype.constructor = AlienComponent;

  AlienComponent.prototype.didMount = function didMount () {
    this.context.editorSession.onRender('document', this.rerender, this, {
      path: [this.props.node.id, 'mood']
    });
  };

  AlienComponent.prototype.dispose = function dispose () {
    this.context.editorSession.off(this);
  };

  AlienComponent.prototype.render = function render ($$) {
    var el = $$('div').addClass('sc-alien sg-hide-selection');
    el.append(
      $$('img').attr('height', 100).attr('src', 'assets/alien.svg')
    );
    if (this.props.node.mood) {
      el.addClass('sm-' + this.props.node.mood);
    }
    // only render the over when not disabled
    if (!this.props.disabled) {
      var overlay = $$('div').addClass('se-overlay').append(
        $$('div').addClass('se-controls').append(
          $$('button').append('Click Here').on('mousedown', this.onMousedown)
        )
      );
      el.append(overlay);
    }
    return el
  };

  AlienComponent.prototype.getDocument = function getDocument () {
    return this.props.node.getDocument()
  };

  AlienComponent.prototype.onMousedown = function onMousedown (event) {
    event.preventDefault();
    event.stopPropagation();

    var editorSession = this.context.editorSession;
    var node = this.props.node;

    var mood = node.mood || 'normal';
    var idx = _moods.indexOf(mood);
    idx = (idx+1) % _moods.length;
    mood = _moods[idx];
    editorSession.transaction(function(tx) {
      tx.set([node.id, 'mood'], mood);
    });
    this.rerender();
  };

  return AlienComponent;
}(substance.Component));

/*
  Package definition of your inline image plugin
*/
var AlienPackage = {
  name: 'alien',
  configure: function(config) {
    config.addNode(Alien);
    config.addComponent(Alien.type, AlienComponent);
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
    content: 'Focused Element'
  });
  body.show('title');
  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: [
      "This shows a custom node which exposes a UI only when focused."
    ].join(' ')
  });
  body.show('intro');
  tx.create({
    type: 'alien',
    id: 'alien'
  });
  body.show('alien');
  tx.create({
    id: 'the-end',
    type: 'paragraph',
    content: [
      "That's it."
    ].join('')
  });
  body.show('the-end');
};

/*
  Application
*/
var cfg = new substance.ProseEditorConfigurator();
cfg.import(substance.ProseEditorPackage);
cfg.import(AlienPackage);

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