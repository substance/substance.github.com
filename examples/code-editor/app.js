(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
  typeof define === 'function' && define.amd ? define(['substance'], factory) :
  (factory(global.substance));
}(this, (function (substance) {

/*
  Node definition
*/
var Script = (function (BlockNode$$1) {
  function Script () {
    BlockNode$$1.apply(this, arguments);
  }if ( BlockNode$$1 ) Script.__proto__ = BlockNode$$1;
  Script.prototype = Object.create( BlockNode$$1 && BlockNode$$1.prototype );
  Script.prototype.constructor = Script;

  

  return Script;
}(substance.BlockNode));

Script.define({
  type: 'script',
  language: 'string',
  source: 'text'
});

/*
  Display component
*/
var ScriptEditor = (function (Component$$1) {
  function ScriptEditor () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) ScriptEditor.__proto__ = Component$$1;
  ScriptEditor.prototype = Object.create( Component$$1 && Component$$1.prototype );
  ScriptEditor.prototype.constructor = ScriptEditor;

  ScriptEditor.prototype.render = function render ($$) {
    var node = this.props.node;
    var el = $$('div').addClass('sc-script-editor');
    el.append(
      $$('div').append(node.source).ref('source')
    );
    return el;
  };

  // don't rerender because this would destroy ACE
  ScriptEditor.prototype.shouldRerender = function shouldRerender () {
    return false;
  };

  ScriptEditor.prototype.didMount = function didMount () {
    var editorSession = this.context.editorSession;
    var node = this.props.node;
    var editor = ace.edit(this.refs.source.getNativeElement());
    // editor.setTheme("ace/theme/monokai");
    editor.setOptions({
      maxLines: Infinity,
    });
    editor.$blockScrolling = Infinity;
    editor.getSession().setMode("ace/mode/" + node.language);
    // TODO: don't we need to dispose the editor?
    // For now we update the model only on blur
    // Option 1: updating on blur
    //   pro: one change for the whole code editing session
    //   con: very implicit, very late, hard to get selection right
    editor.on('blur', this._updateModelOnBlur.bind(this));

    editor.commands.addCommand({
      name: 'escape',
      bindKey: {win: 'Escape', mac: 'Escape'},
      exec: function(editor) {
        this.send('escape');
        editor.blur();
      }.bind(this),
      readOnly: true // false if this command should not apply in readOnly mode
    });

    this.editor = editor;
    editorSession.onRender('document', this._onModelChange, this, {
      path: [node.id, 'source']
    });
  };

  ScriptEditor.prototype.dispose = function dispose () {
    this.context.editorSession.off(this);
    this.editor.destroy();
  };

  ScriptEditor.prototype._updateModelOnBlur = function _updateModelOnBlur () {
    var editor = this.editor;
    var nodeId = this.props.node.id;
    var source = editor.getValue();
    if (source !== this.props.node.source) {
      this.context.editorSession.transaction(function(tx) {
        tx.set([nodeId, 'source'], editor.getValue());
      }, { source: this, skipSelection: true });
    }
  };

  ScriptEditor.prototype._onModelChange = function _onModelChange (change, info) {
    if (info.source !== this) {
      this.editor.setValue(this.props.node.source, -1);
    }
  };

  return ScriptEditor;
}(substance.Component));

ScriptEditor.fullWidth = true;

/*
  Command for script insertion
*/
var InsertScriptCommand = (function (InsertNodeCommand$$1) {
  function InsertScriptCommand () {
    InsertNodeCommand$$1.apply(this, arguments);
  }

  if ( InsertNodeCommand$$1 ) InsertScriptCommand.__proto__ = InsertNodeCommand$$1;
  InsertScriptCommand.prototype = Object.create( InsertNodeCommand$$1 && InsertNodeCommand$$1.prototype );
  InsertScriptCommand.prototype.constructor = InsertScriptCommand;

  InsertScriptCommand.prototype.createNodeData = function createNodeData () {
    return {
      type: 'script',
      language: 'javascript',
      content: ''
    }
  };

  return InsertScriptCommand;
}(substance.InsertNodeCommand));

/*
  Package defintion for script extension
*/
var ScriptPackage = {
  name: 'script',
  configure: function(config) {
    config.addNode(Script);
    config.addComponent(Script.type, ScriptEditor);
    config.addCommand('insert-script', InsertScriptCommand);
    config.addTool('insert-script', substance.Tool, {toolGroup: 'insert'});
    config.addIcon('insert-script', { 'fontawesome': 'fa-code' });
    config.addLabel('insert-script', 'Source Code');
  }
};

/*
  Example document
*/
var fixture = function(tx) {
  var body = tx.get('body');
  tx.create({
    id: 'h1',
    type: 'heading',
    level: 1,
    content: 'Embedding a 3rdParty CodeEditor'
  });
  body.show('h1');
  tx.create({
    id: 'intro',
    type: 'paragraph',
    content: [
      'It is possible to use 3rd party components, a code editor for instance, such as ACE.',
      'The editor us wrapped into an IsolatedNode which makes it independent from the main word-processor interface.' ].join(" ")
  });
  body.show('intro');
  tx.create({
    id: 's1',
    type: 'script',
    language: 'javascript',
    source: [
      "function hello_world() {",
      "  alert('Hello World!');",
      "}"
    ].join("\n")
  });
  body.show('s1');
  tx.create({
    id: 'the-end',
    type: 'paragraph',
    content: [
      "That's it."
    ].join(" ")
  });
  body.show('the-end');
};

/*
  Application
*/
var cfg = new substance.ProseEditorConfigurator();
cfg.import(substance.ProseEditorPackage);
cfg.import(ScriptPackage);

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