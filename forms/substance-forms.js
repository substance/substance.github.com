(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('substance')) :
	typeof define === 'function' && define.amd ? define(['substance'], factory) :
	(factory(global.substance));
}(this, (function (substance) {

var StandaloneHTMLImporter = (function (HTMLImporter$$1) {
  function StandaloneHTMLImporter(config) {
    HTMLImporter$$1.call(this, config)
    this.reset()
  }

  if ( HTMLImporter$$1 ) StandaloneHTMLImporter.__proto__ = HTMLImporter$$1;
  StandaloneHTMLImporter.prototype = Object.create( HTMLImporter$$1 && HTMLImporter$$1.prototype );
  StandaloneHTMLImporter.prototype.constructor = StandaloneHTMLImporter;

  return StandaloneHTMLImporter;
}(substance.HTMLImporter));

var StandaloneHTMLExporter = (function (HTMLExporter$$1) {
	function StandaloneHTMLExporter () {
		HTMLExporter$$1.apply(this, arguments);
	}if ( HTMLExporter$$1 ) StandaloneHTMLExporter.__proto__ = HTMLExporter$$1;
	StandaloneHTMLExporter.prototype = Object.create( HTMLExporter$$1 && HTMLExporter$$1.prototype );
	StandaloneHTMLExporter.prototype.constructor = StandaloneHTMLExporter;

	

	return StandaloneHTMLExporter;
}(substance.HTMLExporter));

/*
  Simplified version of SwitchTextTypeTool that looks nicer
  in overlay-only editing scenarios
*/
var MinimalSwitchTextTypeTool = (function (Tool$$1) {
  function MinimalSwitchTextTypeTool () {
    Tool$$1.apply(this, arguments);
  }

  if ( Tool$$1 ) MinimalSwitchTextTypeTool.__proto__ = Tool$$1;
  MinimalSwitchTextTypeTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
  MinimalSwitchTextTypeTool.prototype.constructor = MinimalSwitchTextTypeTool;

  MinimalSwitchTextTypeTool.prototype.render = function render ($$) {
    var this$1 = this;

    var Button = this.getComponent('button')
    var el = $$('div').addClass('sc-minimal-switch-text-type')
    this.props.textTypes.forEach(function (textType) {
      var button = $$(Button, {
        label: textType.name,
        active: this$1.props.currentTextType.name === textType.name,
        disabled: this$1.props.disabled,
        style: this$1.props.style
      }).attr('data-type', textType.name)
        .on('click', this$1.handleClick)
      el.append(button)
    })
    return el
  };

  MinimalSwitchTextTypeTool.prototype.handleClick = function handleClick (e) {
    var newTextType = e.currentTarget.dataset.type
    e.preventDefault()
    this.context.commandManager.executeCommand(this.getCommandName(), {
      textType: newTextType
    })
  };

  return MinimalSwitchTextTypeTool;
}(substance.Tool));

var MinimalSwitchTextTypePackage = {
  name: 'minimal-switch-text-type',
  configure: function(config) {
    config.addToolGroup('text')
    config.addCommand('minimal-switch-text-type', substance.SwitchTextTypeCommand, {
      disableCollapsedCursor: true
    })
    config.addTool('minimal-switch-text-type', MinimalSwitchTextTypeTool, {
      toolGroup: 'text'
    })
  }
}

var Comment = (function (PropertyAnnotation$$1) {
  function Comment () {
    PropertyAnnotation$$1.apply(this, arguments);
  }if ( PropertyAnnotation$$1 ) Comment.__proto__ = PropertyAnnotation$$1;
  Comment.prototype = Object.create( PropertyAnnotation$$1 && PropertyAnnotation$$1.prototype );
  Comment.prototype.constructor = Comment;

  

  return Comment;
}(substance.PropertyAnnotation));

Comment.define({
  type: 'comment',
  content: { type: 'string', optional: true }
})

// in presence of overlapping annotations will try to render this as one element
Comment.fragmentation = substance.Fragmenter.SHOULD_NOT_SPLIT

var CommentHTMLConverter = {

  type: 'comment',
  tagName: 'span',

  import: function(el, node) {
    node.content = el.attr('data-comment')
  },

  export: function(node, el) {
    el.attr({
      'data-comment': node.content
    })
  }
}

/**
  Tool to edit an existing link.

  Designed so that it can be used either in a toolbar, or within
  an overlay on the Surface.

  @component
*/
var EditCommentTool = (function (Tool$$1) {
  function EditCommentTool () {
    Tool$$1.apply(this, arguments);
  }

  if ( Tool$$1 ) EditCommentTool.__proto__ = Tool$$1;
  EditCommentTool.prototype = Object.create( Tool$$1 && Tool$$1.prototype );
  EditCommentTool.prototype.constructor = EditCommentTool;

  EditCommentTool.prototype.render = function render ($$) {
    var Input = this.getComponent('input')
    var Button = this.getComponent('button')
    var el = $$('div').addClass('sc-edit-comment-tool')

    // GUARD: Return if tool is disabled
    if (this.props.disabled) {
      console.warn('Tried to render EditLinkTool while disabled.')
      return el
    }

    el.append(
      $$(Input, {
        type: 'text',
        path: [this.props.node.id, 'content'],
        placeholder: 'Add comment'
      }),
      $$(Button, {
        icon: 'delete',
        style: this.props.style
      }).attr('title', this.getLabel('delete-comment'))
        .on('click', this.onDelete)
    )
    return el
  };

  EditCommentTool.prototype.onDelete = function onDelete (e) {
    e.preventDefault();
    var node = this.props.node
    var sm = this.context.surfaceManager
    var surface = sm.getFocusedSurface()
    if (!surface) {
      console.warn('No focused surface. Stopping command execution.')
      return
    }
    var editorSession = this.context.editorSession
    editorSession.transaction(function(tx, args) {
      tx.delete(node.id)
      return args
    })
  };

  return EditCommentTool;
}(substance.Tool));

var CommentPackage = {
  name: 'comment',
  configure: function(config, ref) {
    var toolGroup = ref.toolGroup;
    var disableCollapsedCursor = ref.disableCollapsedCursor;

    config.addNode(Comment)
    config.addComponent('comment', substance.AnnotationComponent)
    config.addConverter('html', CommentHTMLConverter)
    // We just reuse the link command here
    config.addCommand('comment', substance.LinkCommand, {
      nodeType: 'comment',
      disableCollapsedCursor: disableCollapsedCursor
    })
    config.addCommand('edit-comment', substance.EditAnnotationCommand, {
      nodeType: 'comment'
    })
    config.addTool('comment', substance.AnnotationTool, {
      toolGroup: toolGroup || 'annotations'
    })
    config.addTool('edit-comment', EditCommentTool, {
      toolGroup: 'overlay'
    })
    config.addIcon('comment', { 'fontawesome': 'fa-comment'})
    config.addLabel('comment', 'Comment')
    config.addLabel('delete-comment', 'Remove comment')
  }
}

var StandaloneConfigurator = (function (Configurator$$1) {
  function StandaloneConfigurator() {
    // Tools are not shown for a collapsed cursor
    var defaultOptions = {
      disableCollapsedCursor: true
    }
    Configurator$$1.call(this)
    this.defineSchema({
      name: 'html',
      ArticleClass: substance.Document,
      defaultTextType: 'paragraph'
    })

    this.import(substance.BasePackage)
    // Default packages
    this.import(substance.ParagraphPackage, defaultOptions)
    this.import(substance.HeadingPackage, defaultOptions)
    this.import(substance.StrongPackage, defaultOptions)
    this.import(substance.EmphasisPackage, defaultOptions)
    this.import(substance.LinkPackage, defaultOptions)
    // Custom SwitchTextType package optimized for overlay-only use
    this.import(MinimalSwitchTextTypePackage)
    this.import(CommentPackage, defaultOptions)
    // HTML importers/exporters
    this.addImporter('html', StandaloneHTMLImporter)
    this.addExporter('html', StandaloneHTMLExporter)

    // Over-write certain labels
    this.addLabel('paragraph', 'P')
    this.addLabel('heading1', 'H1')
    this.addLabel('heading2', 'H2')
    this.addLabel('heading3', 'H3')
  }

  if ( Configurator$$1 ) StandaloneConfigurator.__proto__ = Configurator$$1;
  StandaloneConfigurator.prototype = Object.create( Configurator$$1 && Configurator$$1.prototype );
  StandaloneConfigurator.prototype.constructor = StandaloneConfigurator;

  return StandaloneConfigurator;
}(substance.Configurator));

var RichTextArea = (function (Component$$1) {
  function RichTextArea () {
    Component$$1.apply(this, arguments);
  }

  if ( Component$$1 ) RichTextArea.__proto__ = Component$$1;
  RichTextArea.prototype = Object.create( Component$$1 && Component$$1.prototype );
  RichTextArea.prototype.constructor = RichTextArea;

  RichTextArea.prototype.render = function render ($$) {
    var node = this.props.node
    var el = $$('div').addClass('sc-rich-text-area')
    var editor = $$(substance.ContainerEditor, {
      node: node,
      name: node.id,
      containerId: node.id,
      textTypes: this.getConfigurator().getTextTypes()
    })
    el.append(
      editor
    )
    return el
  };

  RichTextArea.prototype.getConfigurator = function getConfigurator () {
    return this.context.configurator
  };

  RichTextArea.prototype.getHTML = function getHTML () {
    var exporter = this.getConfigurator().createExporter('html')
    var els = exporter.convertContainer(this.props.node)
    if (els.length > 0) {
      return els.map(function(el) {
        return el.outerHTML
      }).join('')
    } else {
      return ''
    }
  };

  return RichTextArea;
}(substance.Component));

/*
  A quasi component, which is actually not used to render an element, just to
  maintain an EditorSession.

  The idea is that we immitate a setup where the page is rendered by an
  Application component, having one EditorSession and multiple Surfaces.

  As this top-level component does not really exist, there is no classical
  render cycle on this level. Instead child components (RichTextArea or
  RichTextField) are just provided with an adequate context, and necessary
  props.
*/
var Forms = (function (BodyScrollPane$$1) {
  function Forms(root) {
    BodyScrollPane$$1.call(this, null, {})
    this.root = substance.DefaultDOMElement.wrapNativeElement(root || window.document.body)
    this.__isMounted__ = true
    this._initialize()
    // NOTE: we need to call didMount manually to consider handlers set
    // in BodyScrollPane
    this.didMount()
  }

  if ( BodyScrollPane$$1 ) Forms.__proto__ = BodyScrollPane$$1;
  Forms.prototype = Object.create( BodyScrollPane$$1 && BodyScrollPane$$1.prototype );
  Forms.prototype.constructor = Forms;

  Forms.prototype._initialize = function _initialize () {
    var editableEls = this.root.findAll('*[editable]')
    var editables = {}
    editableEls.forEach(function(el) {
      var type = el.attr('data-type')
      var id = el.id
      if (!id) {
        console.warn('An editable should have an id.')
        return
      }
      if (!type) {
        console.warn('An editable should have data-type set.')
        return
      }
      if (editables[id]) {
        console.error('An editable with the same id already exists.')
        return
      }
      editables[id] = {
        id: id, type: type, el: el
      }
    })
    var configurator = new StandaloneConfigurator()

    this.configurator = configurator
    this.doc = this._importDocument(editables)
    this.editorSession = new substance.EditorSession(this.doc, {
      configurator: this.configurator
    })
    this.componentRegistry = configurator.getComponentRegistry()
    this.toolGroups = configurator.getToolGroups()
    this.labelProvider = configurator.getLabelProvider()
    this.iconProvider = configurator.getIconProvider()
    // legacy
    this.surfaceManager = this.editorSession.surfaceManager
    this.commandManager = this.editorSession.commandManager
    this.dragManager = this.editorSession.dragManager
    this.macroManager = this.editorSession.macroManager
    this.converterRegistry = this.editorSession.converterRegistry
    this.globalEventHandler = this.editorSession.globalEventHandler
    this.editingBehavior = this.editorSession.editingBehavior
    this.markersManager = this.editorSession.markersManager
    this.editables = this._mountEditables(editables)
  };

  Forms.prototype.getChildContext = function getChildContext () {
    return {
      scrollPane: this,
      configurator: this.configurator,
      editorSession: this.editorSession,
      doc: this.editorSession.getDocument(),
      componentRegistry: this.componentRegistry,
      surfaceManager: this.editorSession.surfaceManager,
      commandManager: this.editorSession.commandManager,
      dragManager: this.editorSession.dragManager,
      macroManager: this.editorSession.macroManager,
      converterRegistry: this.editorSession.converterRegistry,
      globalEventHandler: this.editorSession.globalEventHandler,
      editingBehavior: this.editorSession.editingBehavior,
      markersManager: this.editorSession.markersManager,
      toolGroups: this.toolGroups,
      labelProvider: this.labelProvider,
      iconProvider: this.iconProvider
    }
  };

  Forms.prototype._importDocument = function _importDocument (items) {
    var importer = this.configurator.createImporter('html')
    Object.keys(items).forEach(function (key) {
      var item = items[key]
      var el = item.el
      var id = item.id
      // TODO: we may want to consider multiple editable types
      // (e.g. multi-line vs single line inputs)
      importer.convertContainer(el.children, id)
    })
    return importer.generateDocument()
  };

  Forms.prototype._mountEditables = function _mountEditables (items) {
    var this$1 = this;

    var editables = {}
    var doc = this.doc

    // Setup overlay component
    var Overlay = this.componentRegistry.get('overlay')
    var overlay = new Overlay(this, {
      toolGroups: ['annotations', 'text', 'overlay']
    })
    // initial render
    overlay.rerender()
    // NOTE: as this component is not really in the DOM, we need to trigger
    // didMount on our own
    overlay.triggerDidMount()
    this.root.append(overlay.el)

    Object.keys(items).forEach(function (key) {
      var item = items[key]
      var el = item.el
      var id = item.id
      var editable

      // TODO: we may want to consider multiple editable types
      // (e.g. multi-line vs single line inputs)
      var container = doc.get(id)
      editable = new RichTextArea(this$1, { node: container }, el)
      editables[id] = editable
      // take over ownership
      editable.rerender()

      // NOTE: as this component is not really in the DOM, we need to trigger
      // didMount on our own
      editable.triggerDidMount()
    })
    return editables
  };

  Forms.prototype.getHTML = function getHTML (name) {
    return this.editables[name].getHTML()
  };

  return Forms;
}(substance.BodyScrollPane));

window.onload = function() {
  var forms = new Forms(window.document.body)
  window.substanceForms = forms
}

})));

//# sourceMappingURL=./substance-forms.js.map