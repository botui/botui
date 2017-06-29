window.BotUI = (function (id, opts) {

  if(!id) {
    throw Error('BotUI: Container id is required as first argument.');
  }

  if(!document.getElementById(id)) {
    throw Error('BotUI: Element with id #' + id + ' does not exist.');
  }

  if(!window.Vue) {
    throw Error('BotUI: VueJS is required but not found on this page.');
  }

  var _botApp, _options = {
    fontawesome: true
  },
  _interface = {},
  _actionResolve,
  _regex = {
    link: '/<((?:[a-z][a-z]+))\\|((?:http|https)(?::\\/{2}[\\w]+)(?:[\\/|\\.]?)(?:[^\\s"]*))>/gi'
  },
  _fontAwesome = 'https://use.fontawesome.com/ea731dcb6f.js';

  // merge opts passed to constructor with _options
  if(opts) {
    for (var prop in _options) {
      if (opts.hasOwnProperty(prop)) {
        _options[prop] = opts[prop];
      }
    }
  }

  // function replaceURL(val) {
  //   var exp = /((<)((?:[a-z][a-z]+))(\\|)(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](>))/ig;
  //   return val.replace(exp, "<a href='$2'>$1</a>");
  // }

  function _handleAction(text) {
    if(_instance.action.addMessage) {
      _interface.message.human({
        delay: 100,
        content: text
      });
    }
    _instance.action.show = !_instance.action.autoHide;
  }

  var _botuiComponent = {
    template: 'BOTUI_TEMPLATE', // replaced by HTML template during build. see Gulpfile.js
    data: function () {
      return {
        action: {
          text: {
            size: 30,
            placeholder: 'Write here ..'
          },
          button: {},
          show: false,
          type: 'text',
          autoHide: true,
          addMessage: true
        },
        messages: []
      };
    },
    computed: {
      isMobile: function () {
        return window.innerWidth <= 768;
      }
    },
  	methods: {
  		handle_action_button: function (button) {
        _handleAction(button.text);
        _actionResolve({
          type: 'button',
          text: button.text,
          value: button.value
        });
  		},
  		handle_action_text: function () {
  			if(!this.action.text.value) return;
        _handleAction(this.action.text.value);
  			_actionResolve({
          type: 'text',
          value: this.action.text.value
        });
  			this.action.text.value = '';
  		}
  	}
  };

  _botApp = new Vue({
    components: {
      'bot-ui': _botuiComponent
    }
  }).$mount('#' + id);

  var _instance = _botApp.$children[0]; // to access the component's data

  var _addMessage = function (_msg) {

    if(!_msg.content) {
      throw Error('BotUI: "content" is required in message object.');
    }

    _msg.visible = _msg.delay ? false : true;
    var _index = _instance.messages.push(_msg) - 1;

    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        _instance.messages[_index].visible = true;
        resolve(_index);
      }, _msg.delay || 0);
    });
  };

  _interface.message =  {
    add: function (addOpts) {
      return _addMessage(addOpts);
    },
    bot: function (addOpts) {
      addOpts = addOpts || {};
      return _addMessage(addOpts);
    },
    human: function (addOpts) {
      addOpts = addOpts || {};
      addOpts.human = true;
      return _addMessage(addOpts);
    },
    get: function (index) {
      return _instance.messages[index];
    },
    remove: function (index) {
      return !!_instance.messages.splice(index, 1).length; // return a boolean
    },
    update: function (index, msg) { // only content can be updated, not the message type.
      _instance.messages[index].content = msg.content;
      return Promise.resolve();
    },
    removeAll: function () {
      return !!_instance.messages.splice(0, _instance.messages.length).length;
    }
  };

  function mergeAtoB(objA, objB) {
    for (var prop in objA) {
      if (!objB.hasOwnProperty(prop)) {
        objB[prop] = objA[prop];
      }
    }
  }

  var _showActions = function (_opts) {

    mergeAtoB({
      type: 'text',
      autoHide: true,
      addMessage: true
    }, _opts);

    _instance.action.type = _opts.type;
    _instance.action.autoHide = _opts.autoHide;
    _instance.action.addMessage = _opts.addMessage;

    return new Promise(function(resolve, reject) {
      _actionResolve = resolve;
      setTimeout(function () {
        _instance.action.show = true;
        if(_opts.type == 'text') {
          Vue.nextTick(function () {
            _instance.$refs.input.focus();
          });
        }
      }, _opts.delay || 0);
    });
  };

  _interface.action = {
    show: _showActions,
    hide: function () {
      _instance.action.show = false;
    },
    text: function (_opts) {
      _instance.action.text = _opts;
      return _showActions(_opts);
    },
    button: function (_opts) {
      _opts.type = 'button';

      if(!_opts.buttons) {
        throw Error('BotUI: "buttons" property is expected as an array.');
      }

      _instance.action.button.buttons = _opts.buttons;
      return _showActions(_opts);
    }
  };

  function loadFontAwesome() {
    var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = _fontAwesome;

    document.body.appendChild(script);
  }

  if(_options.fontawesome) {
    loadFontAwesome();
  }

  if(_options.debug) {
    _interface._botApp = _botApp; // current Vue instance
  }

  return _interface;
});
