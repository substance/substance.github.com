(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

var Expression = (function (InlineNode$$1) {
  function Expression () {
    InlineNode$$1.apply(this, arguments);
  }

  if ( InlineNode$$1 ) Expression.__proto__ = InlineNode$$1;
  Expression.prototype = Object.create( InlineNode$$1 && InlineNode$$1.prototype );
  Expression.prototype.constructor = Expression;

  Expression.prototype.getValue = function getValue () {
    if (this.hasOwnProperty('_preliminaryValue')) {
      return this._preliminaryValue;
    } else {
      return this.value;
    }
  };

  Expression.prototype.getDisplayValue = function getDisplayValue () {
    var value = this.getEvaluatedValue();
    if (this.units) {
      var factor = Expression.UNITS[this.units];
      value /= factor;
      // round to 2-digits
      value = Math.round(value*100)/100;
      value = [value, this.units].join(' ');
    }
    return String(value);
  };

  Expression.prototype.getEvaluatedValue = function getEvaluatedValue () {
    var annotations = this.getAnnotations();
    var unfoldedExpression;
    if (annotations && annotations.length > 0) {
      var parts = [];
      var fragmenter = new substance.Fragmenter({
        onText: function(context, text) {
          if (text !== '$') {
            parts.push(text);
          }
        },
        onEnter: function(fragment) {
          var node = fragment.node;
          if (node.type === 'expression-reference') {
            parts.push(node.getEvaluatedValue());
          }
        }
      });
      fragmenter.start(null, this.getValue(), annotations);
      unfoldedExpression = parts.join('');
    } else {
      unfoldedExpression = String(this.getValue());
    }

    var result;
    try {
      result = window.eval(unfoldedExpression); // eslint-disable-line no-eval
    } catch (err) {
      console.error(err);
      result = "ERROR";
    }
    return result;
  };

  Expression.prototype.getAnnotations = function getAnnotations () {
    return this.getDocument().getIndex('annotations').get([this.id, 'value']);
  };

  return Expression;
}(substance.InlineNode));

Expression.type = 'expression';

Expression.schema = {
  value: { type: 'string', default: ' ' },
  units: { type: 'string', optional: true },
  variable: { type: 'boolean', optional: true }
};

Expression.UNITS = {
  'GW': 1000000000,
  'TW': 1000000000000,
  '%': 1/100,
};

var ExpressionComponent = (function (InlineNodeComponent$$1) {
  function ExpressionComponent () {
    InlineNodeComponent$$1.apply(this, arguments);
  }

  if ( InlineNodeComponent$$1 ) ExpressionComponent.__proto__ = InlineNodeComponent$$1;
  ExpressionComponent.prototype = Object.create( InlineNodeComponent$$1 && InlineNodeComponent$$1.prototype );
  ExpressionComponent.prototype.constructor = ExpressionComponent;

  ExpressionComponent.prototype.didMount = function didMount () {
    InlineNodeComponent$$1.prototype.didMount.call(this);

    this.context.editorSession.onRender('document', this.rerender, this, {
      path: [this.props.node.id, 'value']
    });

    // HACK: we are patching the rendered element
    // by looking at the selection, and if there is an
    // expression pointing to us, we enable highlighting
    // TODO: this should be part of _deriveStateFromSelection
    this.context.editorSession.onPostRender('selection', this.onSelectionChanged, this);

    // HACK: we use node and document as event channel
    var node = this.props.node;
    node.on('toggle:showSource', this.toggleShowSource, this);
    node.getDocument().on('expression:update', this.rerender, this);
  };

  ExpressionComponent.prototype.dispose = function dispose () {
    InlineNodeComponent$$1.prototype.dispose.call(this);

    this.context.editorSession.off(this);

    var node = this.props.node;
    node.off(this);
    node.getDocument().off(this);
  };

  ExpressionComponent.prototype.render = function render ($$) {
    var el = InlineNodeComponent$$1.prototype.render.call(this, $$);
    el.addClass('sc-expression');

    var node = this.props.node;
    if (this.state.showSource) {
      el.addClass('sm-show-source');
    } else {
      el.addClass('sm-inline');
      if (node.variable) {
        el.addClass('sm-variable');
      }
    }
    return el;
  };

  ExpressionComponent.prototype.renderContent = function renderContent ($$) {
    var node = this.props.node;
    var el = $$('span');
    if (this.state.showSource) {
      el.append(
        $$(substance.TextPropertyEditor, {
          disabled: this.props.disabled,
          tagName: 'span',
          path: [node.id, 'value'],
          withoutBreak: true
        }).ref('editor')
      );
      el.append(
        $$('button').ref('close-button')
          .addClass('se-confirm-value')
          .attr('contenteditable', false)
          .append(this.context.iconProvider.renderIcon($$, 'confirm-value'))
          .on('mousedown', this.confirmValue)
      );
    } else {
      el.append(
        node.getDisplayValue()
      );
    }
    return el
  };

  ExpressionComponent.prototype.confirmValue = function confirmValue () {
    this.extendState({ showSource: false });
    this.selectNode();
  };

  ExpressionComponent.prototype.toggleShowSource = function toggleShowSource () {
    this.extendState({ showSource:!this.state.showSource });
  };

  ExpressionComponent.prototype.onSelectionChanged = function onSelectionChanged () {
    var selectionState = this.context.editorSession.getSelectionState();
    var annos = selectionState.getAnnotationsForType('expression-reference');
    if (annos.length === 1 && annos[0].expressionId === this.props.node.id) {
      this.el.addClass('sm-highlighted');
    } else {
      this.el.removeClass('sm-highlighted');
    }
  };

  return ExpressionComponent;
}(substance.InlineNodeComponent));

var ExpressionCommand = (function (InsertInlineNodeCommand$$1) {
  function ExpressionCommand () {
    InsertInlineNodeCommand$$1.apply(this, arguments);
  }

  if ( InsertInlineNodeCommand$$1 ) ExpressionCommand.__proto__ = InsertInlineNodeCommand$$1;
  ExpressionCommand.prototype = Object.create( InsertInlineNodeCommand$$1 && InsertInlineNodeCommand$$1.prototype );
  ExpressionCommand.prototype.constructor = ExpressionCommand;

  ExpressionCommand.prototype.createNodeData = function createNodeData () {
    return {
      type: 'expression'
    }
  };

  return ExpressionCommand;
}(substance.InsertInlineNodeCommand));

var EditExpressionCommand = (function (Command$$1) {
  function EditExpressionCommand () {
    Command$$1.apply(this, arguments);
  }

  if ( Command$$1 ) EditExpressionCommand.__proto__ = Command$$1;
  EditExpressionCommand.prototype = Object.create( Command$$1 && Command$$1.prototype );
  EditExpressionCommand.prototype.constructor = EditExpressionCommand;

  EditExpressionCommand.prototype.getCommandState = function getCommandState (params) {
    // let sel = this._getSelection(params)
    var annos = this._getAnnotationsForSelection(params);
    var newState = {
      disabled: true,
    };
    if (annos.length === 1) {
      newState.disabled = false;
      newState.node = annos[0];
    }
    return newState
  };

  EditExpressionCommand.prototype.execute = function execute (params) { }; // eslint-disable-line

  EditExpressionCommand.prototype._getAnnotationsForSelection = function _getAnnotationsForSelection (params) {
    return params.selectionState.getAnnotationsForType('expression')
  };

  return EditExpressionCommand;
}(substance.Command));

var EditExpressionTool = (function (Tool$$1) {
  function EditExpressionTool () {
    Tool$$1.apply(this, arguments);
  }

  if ( Tool$$1 ) EditExpressionTool.__proto__ = Tool$$1;
  EditExpressionTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
  EditExpressionTool.prototype.constructor = EditExpressionTool;

  EditExpressionTool.prototype.render = function render ($$) {
    var node = this.props.node;
    var Button = this.getComponent('button');

    var el = $$('div').addClass('sc-edit-expression-tool');
    el.append(
      $$(Button, {
        icon: 'edit-value',
        style: this.props.style
      }).attr('title', 'Toggle mode')
        .on('click', this._onToggle)
    );
    if (node.variable) {
      el.append($$('div').addClass('se-separator'));
      el.append(
        $$(Button, {
          icon: 'drag-value',
          style: this.props.style
        }).attr('title', 'Change Value')
          .on('mousedown', this._startDragValue)
      );
    }
    el.append($$('div').addClass('se-separator'));
    el.append(
      $$(Button, {
        icon: 'delete',
        style: this.props.style
      }).attr('title', 'Remove')
        .on('click', this._onDelete)
    );
    return el
  };

  EditExpressionTool.prototype._onToggle = function _onToggle () {
    this.props.node.emit('toggle:showSource');
  };

  EditExpressionTool.prototype._onDelete = function _onDelete () {
    var node = this.props.node;
    var editorSession = this.context.editorSession;
    editorSession.transaction(function (tx) {
      tx.selection = node.getSelection();
      tx.deleteSelection();
    });
  };

  EditExpressionTool.prototype._startDragValue = function _startDragValue (event) {
    var node = this.props.node;
    var wdoc = substance.DefaultDOMElement.wrapNativeElement(window.document);
    wdoc.on('mousemove', this._onDragValue, this);
    wdoc.on('mouseup', this._finishDragValue, this);
    this._startX = event.clientX;
    this._value = node.getEvaluatedValue();
  };

  EditExpressionTool.prototype._onDragValue = function _onDragValue (event) {
    var node = this.props.node;
    // console.log('UPDATING VALUE')
    var diff = event.clientX - this._startX;
    if (node.units) {
      diff *= Expression.UNITS[node.units];
    }
    var prelimValue = this._value + diff;
    // console.log('#### ', prelimValue)
    node._preliminaryValue = prelimValue;
    node.getDocument().emit('expression:update');
  };

  EditExpressionTool.prototype._finishDragValue = function _finishDragValue () {
    var wdoc = substance.DefaultDOMElement.wrapNativeElement(window.document);
    wdoc.off(this);

    var node = this.props.node;
    var editorSession = this.context.editorSession;
    var newVal = node._preliminaryValue;
    delete node._preliminaryValue;
    if (node.value !== newVal) {
      editorSession.transaction(function (tx) {
        tx.set([node.id, 'value'], newVal);
      });
    }
    node.getDocument().emit('expression:update');
  };

  return EditExpressionTool;
}(substance.Tool));

var ExpressionPackage = {
  name: 'expression',
  configure: function(config) {
    config.addNode(Expression);
    config.addComponent(Expression.type, ExpressionComponent);
    config.addCommand('expression', ExpressionCommand, { nodeType: Expression.type });
    config.addTool('expression', substance.AnnotationTool, {toolGroup: 'annotations'});
    config.addIcon('expression', { 'fontawesome': 'fa-cube' });
    config.addCommand('edit-expression', EditExpressionCommand, { nodeType: 'expression' });
    config.addTool('edit-expression', EditExpressionTool, {toolGroup: 'overlay'});
    config.addIcon('edit-value', { 'fontawesome': 'fa-edit' });
    config.addIcon('confirm-value', { 'fontawesome': 'fa-check' });
    config.addIcon('drag-value', { 'fontawesome': ' fa-arrows-h' });
  }
};

var ExpressionReference = (function (InlineNode$$1) {
  function ExpressionReference () {
    InlineNode$$1.apply(this, arguments);
  }

  if ( InlineNode$$1 ) ExpressionReference.__proto__ = InlineNode$$1;
  ExpressionReference.prototype = Object.create( InlineNode$$1 && InlineNode$$1.prototype );
  ExpressionReference.prototype.constructor = ExpressionReference;

  ExpressionReference.prototype.getEvaluatedValue = function getEvaluatedValue () {
    var expressionNode = this.getExpressionNode();
    if (expressionNode) {
      return expressionNode.getEvaluatedValue();
    }
  };

  ExpressionReference.prototype.getExpressionNode = function getExpressionNode () {
    return this.getDocument().get(this.expressionId);
  };

  return ExpressionReference;
}(substance.InlineNode));

ExpressionReference.type = 'expression-reference';

ExpressionReference.schema = {
  expressionId: 'id'
};

var ExpressionReferenceComponent = (function (InlineNodeComponent$$1) {
  function ExpressionReferenceComponent () {
    InlineNodeComponent$$1.apply(this, arguments);
  }

  if ( InlineNodeComponent$$1 ) ExpressionReferenceComponent.__proto__ = InlineNodeComponent$$1;
  ExpressionReferenceComponent.prototype = Object.create( InlineNodeComponent$$1 && InlineNodeComponent$$1.prototype );
  ExpressionReferenceComponent.prototype.constructor = ExpressionReferenceComponent;

  ExpressionReferenceComponent.prototype.render = function render ($$) { // eslint-disable-line
    var el = InlineNodeComponent$$1.prototype.render.call(this, $$);
    el.addClass('sc-expression-reference');
    return el
  };

  ExpressionReferenceComponent.prototype.renderContent = function renderContent ($$) {
    var node = this.props.node;
    var expressionNode = node.getExpressionNode();
    return $$('span').append(expressionNode.getDisplayValue());
  };

  ExpressionReferenceComponent.prototype.setState = function setState (newState) {
    InlineNodeComponent$$1.prototype.setState.call(this, newState);
    var expressionNode = this.props.node.getExpressionNode();
    if (newState.mode === 'selected') {
      expressionNode.highlighted = true;
      expressionNode.emit('highlighted:changed');
    } else if (expressionNode.highlighted) {
      expressionNode.highlighted = false;
      expressionNode.emit('highlighted:changed');
    }
  };

  return ExpressionReferenceComponent;
}(substance.InlineNodeComponent));

// TODO: we need a way to hook into the dropping of
// inline nodes
var DropExpressionReference = function DropExpressionReference () {};

DropExpressionReference.prototype.drop = function drop (params, context) { // eslint-disable-line no-unused-vars
  // var source = params.source;
  // var target = params.target;
  // var surface = target.surface;
  // var selection = target.selection;
  // var path = target.path;
  // if (!source || !source.component.is('.sc-expression')) return;
  // if (!surface || !selection || !path) return;
  // var sourceExpr = source.component.props.node;
  // var targetExpr = surface.getDocument().get(path[0]);
  // if (targetExpr.type !== 'expression') return;

  // console.log('Inserting reference for %s into exression %s', sourceExpr.id, targetExpr.id);

  // surface.transaction(function(tx) {
  // tx.before.selection = selection;
  // return insertInlineNode(tx, {
  //   selection: selection,
  //   node: {
  //     type: 'expression-reference',
  //     expressionId: sourceExpr.id
  //   }
  // });
  // });
};

var ExpressionReferencePackage = {
  name: 'expression-reference',
  configure: function(config) {
    config.addNode(ExpressionReference);
    config.addComponent(ExpressionReference.type, ExpressionReferenceComponent);
    // FIXME
    // config.addDragAndDrop(DropExpressionReference);
  }
};

var fixture = function(tx) {
  var body = tx.get('body');

  tx.create({
    id: 'title',
    type: 'heading',
    level: 1,
    content: 'Growth of solar power'
  });
  body.show('title');

  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: [
      "This shows an example inspired by Tangle which is described in the article What can Technologist do about Climate Change by Bret Victor."
    ].join(' ')
  });
  tx.create({
    id: 'link-tangle',
    type: 'link',
    title: 'Tangle',
    url: 'http://worrydream.com/Tangle',
    path: ['intro', 'content'],
    startOffset: 34,
    endOffset: 40
  });
  tx.create({
    id: 'link-climate-change',
    type: 'link',
    title: 'What can Technologist do about Climate Change',
    url: 'http://worrydream.com/ClimateChange/#tools',
    path: ['intro', 'content'],
    startOffset: 75,
    endOffset: 120
  });
  body.show('intro');

  tx.create({
    id: 'p1',
    type: 'paragraph',
    content: [
      "The world consumes $. Solar accounts for $, or $."
    ].join(' ')
  });
  tx.create({
    type: 'expression',
    id: 'total-consumption',
    path: ['p1', 'content'],
    startOffset: 19,
    endOffset: 20,
    value: '17000000000000',
    units: 'TW',
    showSource: false
  });

  tx.create({
    type: 'expression',
    id: 'total-solar',
    path: ['p1', 'content'],
    startOffset: 41,
    endOffset: 42,
    value: '178000000000',
    units: 'GW',
    showSource: false
  });

  tx.create({
    type: 'expression',
    id: 'solar-ratio',
    path: ['p1', 'content'],
    startOffset: 47,
    endOffset: 48,
    value: '$ / $',
    units: '%',
    showSource: false
  });
  tx.create({
    type: 'expression-reference',
    id: 'er1',
    path: ['solar-ratio', 'value'],
    startOffset: 0,
    endOffset: 1,
    expressionId: 'total-solar'
  });
  tx.create({
    type: 'expression-reference',
    id: 'er2',
    path: ['solar-ratio', 'value'],
    startOffset: 4,
    endOffset: 5,
    expressionId: 'total-consumption'
  });
  body.show('p1');

  tx.create({
    id: 'p2',
    type: 'paragraph',
    content: [
      "To reach $ solar energy by $, it would have to grow $ per year."
    ].join(' ')
  });
  tx.create({
    type: 'expression',
    id: 'target-solar-ratio',
    path: ['p2', 'content'],
    startOffset: 9,
    endOffset: 10,
    value: '1.0',
    units: '%',
    variable: true,
    showSource: false
  });
  tx.create({
    type: 'expression',
    id: 'target-year',
    path: ['p2', 'content'],
    startOffset: 27,
    endOffset: 28,
    value: '2050',
    variable: true,
    showSource: false
  });
  tx.create({
    type: 'expression',
    id: 'growth',
    path: ['p2', 'content'],
    startOffset: 52,
    endOffset: 53,
    value: 'Math.pow(10, Math.log10($/$)/($-2016))-1.0',
    units: '%',
    showSource: false
  });
  tx.create({
    type: 'expression-reference',
    id: 'er3',
    path: ['growth', 'value'],
    startOffset: 24,
    endOffset: 25,
    expressionId: 'target-solar-ratio'
  });
  tx.create({
    type: 'expression-reference',
    id: 'er4',
    path: ['growth', 'value'],
    startOffset: 26,
    endOffset: 27,
    expressionId: 'solar-ratio'
  });
  tx.create({
    type: 'expression-reference',
    id: 'er5',
    path: ['growth', 'value'],
    startOffset: 30,
    endOffset: 31,
    expressionId: 'target-year'
  });
  body.show('p2');

  tx.create({
    id: 'notes',
    type: 'heading',
    level: 2,
    content: 'Notes'
  });
  body.show('notes');
  tx.create({
    id: 'note1',
    type: 'paragraph',
    content: [
      "This is Work-In-Progress. At the current state the example demonstrates",
      "that expressions can be used symbolically in other expressions (red color).",
      "Some expressions (green color) can be changed by the user updating the value of",
      "all dependent expressions." ].join(' ')
  });
  body.show('note1');

  tx.create({
    id: 'links-heading',
    type: 'heading',
    level: 2,
    content: 'Links'
  });
  body.show('links-heading');
  tx.create({
    id: 'link1',
    type: 'list-item',
    content: [
      "http://worrydream.com/ClimateChange/#tools"
    ].join(' ')
  });
  tx.create({
    id: 'link2',
    type: 'list-item',
    content: [
      "http://worrydream.com/Tangle"
    ].join(' ')
  });
  tx.create({
    id: 'links',
    type: 'list',
    items: ['link1', 'link2']
  });
  body.show('links');
};

var cfg = new substance.ProseEditorConfigurator();
cfg.import(substance.ProseEditorPackage);
cfg.import(ExpressionPackage);
cfg.import(ExpressionReferencePackage);

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