(function($, win, doc){

    $.baseui = UI = {
        util: {},
        supports: {},
        fn: {}
    };

    // supports
    //---------------------------------------------------------
    UI.supports.transition = (function() {

        var transitionEnd = (function() {

            var element = doc.body || doc.documentElement,
                transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition' : 'transitionend',
                    'OTransition' : 'oTransitionEnd otransitionend',
                    'transition' : 'transitionend'
                }, 
                transition = false;

            for (var name in transEndEventNames){
                if (element.style[name] !== undefined) {
                    transition = transEndEventNames[name];
                }
            }

            return transition;
        })();

        return transitionEnd && { end: transitionEnd };
    })();

    UI.supports.mutationObserver = (function() {
        return true && win.MutationObserver || win.WebKitMutationObserver;
    })();

    // util
    //---------------------------------------------------------
    UI.util.initByDataAttr = function(context) {

        $(context || doc).find("[data-baseui]:not([data-baseui-skip])").each(function(){
            
            var element = $(this), 
                data    = element.attr("data-baseui"),
                fn      = $.trim(data.split(">")[0]),
                options = UI.util.parseOptions(data);

            element.baseui(fn, options);

        }).attr("data-baseui-skip", "true");

    };

    UI.util.parseOptions = function(string) {

        var start = string.indexOf(">"), options = {};

        if (start != -1) {
            try {
                options = (new Function("", "var json = {" + string.substr(start+1) + "}; return JSON.parse(JSON.stringify(json));"))();
            } catch(e) {
                $.error(e.message);
            }
        }

        return options;
    };

    // misc
    //---------------------------------------------------------
    $.fn.baseui = function (fn, options) {

        if (!UI.fn[fn]) {
            $.error("Base UI component [" + fn + "] does not exist.");
            return this;
        }

        var args = arguments;

        return this.each(function() {
            var $this = $(this), 
                obj   = $this.data(fn);

            if (!obj) { 
                obj = new UI.fn[fn](this, options);
                $this.data(fn, obj);
            }

            if (obj && typeof(options) == 'string') {
                obj[options].apply(obj, Array.prototype.slice.call(args, 2));
            }
        });

    };

    // auto data ui on dom manipulation
    $(function(){
        
        UI.util.initByDataAttr(doc);

        var target   = doc.body,
            MO       = UI.supports.mutationObserver || function(callback) { 
                        this.observe = function(target, config){
                            setTimeout(function(){ 
                                UI.util.initByDataAttr(doc); 
                            }, 1000);
                        };
            },
            observer = new MO(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        UI.util.initByDataAttr(doc);
                    }
                });
            });

        observer.observe(target, { childList: true});
    });


})(jQuery, window, document);
(function($, UI){


    function Button(element, options){

        var $this = this;

        this.element = $(element);
        this.options = $.extend({}, options);
        this.hidden  = $('<input type="hidden" name="" value="" />');
        
        if(this.options.active) this.element.addClass("active");

        if(this.options.name){
            this.hidden.attr("name", this.options.name).val($this.element.hasClass("active") ? 1:0);
            this.element.after(this.hidden);
        }

        this.element.on("click", function(e){
            e.preventDefault();
            $this.toggle();
            $(his).blur();
        });
    }
    
    $.extend(Button.prototype, {
        options: {
            active: false,
            name: false
        },

        toggle: function() {
            this.element.toggleClass("active");
            this.hidden.val(this.element.hasClass("active") ? 1:0);
        },

        activate: function(){
            this.element.addClass("active");
            this.hidden.val(1);
        },

        deactivate: function() {
            this.element.removeClass("active");
            this.hidden.val(0);
        },

        val: function() {
            return this.hidden.val();
        }
    });

    function ButtonRadioGroup(element, options) {
        
        var $this    = this, 
            $element = $(element);

        this.options = $.extend({}, this.options, options);
        this.hidden  = $('<input type="hidden" name="" value="" />');

        if(this.options.name){
            this.hidden.attr("name", this.options.name).val(this.options.value);
            $element.after(this.hidden);

            if(this.options.value !== false){
                $element.find(".button[data-value='"+this.options.value+"']:first").addClass("active");
            }
        }

        this.element = $element.on("click", ".button", function(e) {
            e.preventDefault();
            $element.find(".button").not(this).removeClass("active");
            $element.trigger("change", [$(this).addClass("active").blur()]);

            $this.hidden.val($(this).data("value"));
        });
    }

    $.extend(ButtonRadioGroup.prototype, {
        options: {
            name: false,
            value: false
        },

        val: function() {
            return this.hidden.val();
        }
    });

    UI.fn.button     = Button;
    UI.fn.radiogroup = ButtonRadioGroup;

})(jQuery, jQuery.baseui);
(function($, UI){


    var active   = false,
        Dropdown = function(element, options) {
        
        var $this = this;

        this.options = $.extend({}, this.options, options);
        this.element = $(element).on("click", ".dp-toggle", function(e){
            e.preventDefault();
            $this.toggle();
        });

        if (this.element.is(".dp-toggle")) {
            this.element.on("click", function(e){
                e.preventDefault();
                $this.toggle();
            });
        }
    };

    $.extend(Dropdown.prototype, {

        options: {

        },

        toggle: function() {
            this.element.toggleClass("open");
            active = this.element.hasClass("open") ? this.element : false;
        }

    });

    $(document).on("click", function() {
        $(".open[data-baseui]").not(active).removeClass("open");
        active = false;
    });

    UI.fn.dropdown = Dropdown;

})(jQuery, jQuery.baseui);
(function($, UI){
    

    var eventregistred = false;


    function signElements(element) {
        
        $(document).find("[data-baseui='focuselement']").removeClass("baseui-focused");

        element.parents("[data-baseui='focuselement']").addClass("baseui-focused");

        if(element.is("[data-baseui='focuselement']")){
            element.addClass("baseui-focused");
        }
    }


    UI.fn.focuselement = function(){

        if (!eventregistred) {

            $(document).on("click focus", function(e){

                signElements($(e.target));
            });

            eventregistred = true;
        }
    };

})(jQuery, jQuery.baseui);

(function($, UI){
  
  var growlContainer;

  /*
    Status object
  */

  function Status(message, options) {
      
    var $this = this,
        hover = false;

    this.settings = $.extend({
      "title": false,
      "message": message,
      "speed": 500,
      "timeout": 3000
    }, options);

    this.status = $('<div class="growlstatus" style="display:none;"><div class="growlstatus-close"></div>'+this.settings.message+'</div>');

    //append status
    growlContainer.prepend(this.status);

    //bind close button
    this.status.delegate(".growlstatus-close", 'click', function(){
      $this.close(true);
    });

    //show title
    if(this.settings.title!==false){
      this.status.prepend('<div class="growltitle">'+this.settings.title+'</div>');
    }

    this.status.hover(
      function(){
        hover = true;
      },
      function(){
        
        hover = false;

        if ($this.settings.timeout!==false) {
          window.setTimeout(function(){
            $this.close();
          }, $this.settings.timeout);
        }
      }
    ).fadeIn(this.settings.speed,function(){

      if($this.settings.timeout!==false){
        window.setTimeout(function(){
          $this.close();
        }, $this.settings.timeout);
      }
    });
    
    this.close = function(force){
    
      if(!hover || force){
        $this.status.animate({opacity:"0.0"}, $this.settings.speed).slideUp(function(){
              $this.status.remove();
        });
      }
    };
  }


  UI.growl = function(message, options) {
    
      var o = options || {};

      if(o.webnotification && window["webkitNotifications"]){
        
        if (webkitNotifications.checkPermission() === 0) {
          
          var title = o["title"] ? o.title:" ";

          return webkitNotifications.createNotification('data:image/gif;base64,R0lGODlhAQABAJEAAAAAAP///////wAAACH5BAEHAAIALAAAAAABAAEAAAICVAEAOw==', title, $('<div>'+message+'</div>').text()).show();
        }else{
          webkitNotifications.requestPermission();
        }
      }

      if (!growlContainer) {
        growlContainer = $('<div id="growlcontainer"></div>').appendTo("body");
      }

      return new Status(message, o);
  };

})(jQuery, jQuery.baseui);
(function($, UI){
    

    function MobileMenu(element, options){

        var $this = this;

        this.element = $(element);
        this.options = $.extend({}, options);

        this.element.on("click", ">li", function(){
            $this.element.find("li.active").not(this).removeClass("active");
            $(this).toggleClass("active");
        });
    }

    $.extend(MobileMenu.prototype, {

    });

    UI.fn.mobilemenu = MobileMenu;

})(jQuery, jQuery.baseui);
(function($, UI){
	

	var tpl = '<div class="modal-win animated"><div></div><div class="modal-close"></div></div>',
		current = false,
		overlay = false,
		persist = false,
		$win = $(window),
		$doc = $(document);

	UI.modal = function(content, options){
		
		var o = $.extend({
                'title'     : false,
                'closeOnEsc': true,
                'height'    : 'auto',
                'width'     : 'auto',
                'effect'    : false,

                //events
                'beforeShow'  : function(){},
                'beforeClose' : function(){},
				'onClose'     : function(){}
        }, options);

        if(current){
            UI.modal.close();
        }

        current = $(tpl).addClass(o.effect);

        var container = current.children().eq(0);

		if(o.height != 'auto'){
		    container.css({
		      'height'    : o.height,
		      'overflow-y': 'auto'
		    });
		}

		if(o.width != 'auto'){
		    container.css({
		      'width'     : o.width,
		      'overflow-x': 'auto'
		    });
		}

		if (typeof content === 'object') {
			// convert DOM object to a jQuery object
			content = content instanceof jQuery ? content : $(content);
            
            if(content.parent().length) {
                persist = content;
                persist.data("sb-persist-parent", content.parent());
            }
		} else if (typeof content === 'string' || typeof content === 'number') {
			// just insert the data as innerHTML
			content = $('<div></div>').html(content);
		} else {
			// unsupported data type!
			content = $('<div></div>').html('Modal Error: Unsupported data type: ' + typeof content);
		}
      
        container.append(content);

        overlay = $("<div>").addClass('modal-overlay').css({
			top: 0,	left: 0, position: 'absolute', opacity:0.6
		}).prependTo('body');

		UI.modal.fit();

	};

	UI.modal.close = function(){
		
		if(!current) return;

        if (persist) {
	        persist.appendTo(persist.data("sb-persist-parent"));
	        persist = false;
        }

        current.remove();
        overlay.remove();

        current = false;
	};

	UI.modal.fit = function(){
        current.appendTo("body").css({
	        'left' : ($win.width()/2-current.outerWidth()/2),
	        'top'  : ($win.height()/2-current.outerHeight()/2),
	        'visibility': "visible"
        });

        overlay.css({
            width: $doc.width(),
            height: $doc.height()
        });
	};

	$(document).bind('keydown.modal', function (e) {
        if (current && e.keyCode === 27) { // ESC
            e.preventDefault();
            UI.modal.close();
        }
    }).delegate(".modal-close", "click", function(){
        UI.modal.close();
    });

	$win.bind('resize.modal', function(){
        
        if(!current) return;

        UI.modal.fit();
    });

})(jQuery, jQuery.baseui);
(function($, UI){


    var $this = null;
    
    UI.topbox = $this = {
        
        defaults: {
            'title'     : false,
            'closeOnEsc': true,
            'closeBtn'  : true,
            'theme'     : 'default',
            'height'    : 'auto',
            'width'     : 'auto',
            'speed'     : 500,
            'easing'    : 'swing',
            'buttons'   : false,
            
            //private
            '_status'   : true,

            //events
            'beforeShow'  : function(){},
            'beforeClose' : function(){},
            'onClose'     : function(){}
        },

        box: null,
        options: {},
        persist: false,
        
        show: function(content, options) {
            
            if(this.box) {this.clear();}
            
            this.options = $.extend({}, this.defaults, options);
			
            var tplDlg = '<div class="topbox-window '+$this.options.theme+'">';
                tplDlg+=  '<div class="topbox-close"></div>';
                tplDlg+=  '<div class="topbox-title" style="display:none;"></div>';
                tplDlg+=  '<div class="topbox-content"><div class="topbox-innercontent"></div></div>';
                tplDlg+=  '<div class="topbox-buttonsbar"><div class="topbox-buttons"></div></div>';
                tplDlg+= '</div>';
            
            this.box = $(tplDlg);

            if(!this.options.closeBtn) {
                this.box.find(".topbox-close").hide();
            } else {
                this.box.find(".topbox-close").bind("click",function(){
                    $this.close();
                });   
            }
            
            if(this.options.buttons){
                
                var btns = this.box.find(".topbox-buttons");
                
                $.each(this.options.buttons, function(caption, fn){
                    
					$('<button type="button" class="topbox-button">'+caption+'</button>').bind("click", function(e){
						e.preventDefault();
						fn.apply($this);
                    }).appendTo(btns);
                });
            }else{
               this.box.find(".topbox-buttonsbar").hide(); 
            }
            
            if($this.options.height != 'auto'){
                this.box.find(".topbox-innercontent").css({
                  'height'    : $this.options.height,
                  'overflow-y': 'auto'
                });
            }
            
            if($this.options.width != 'auto'){
                this.box.find(".topbox-innercontent").css({
                  'width'     : $this.options.width,
                  'overflow-x': 'auto'
                });
            }
      
            this.setContent(content).setTitle(this.options.title);
			
			
            this.box.css({
                'opacity'   : 0,
                'visibility': 'hidden'
            }).appendTo("body");
			
			this.options.beforeShow.apply(this);
			
            this.box.css({
                'left' : ($(window).width()/2-$this.box.width()/2),
                'top'  : ((-1.5) * $this.box.height())
            }).css({
                'visibility': 'visible'
            }).animate({
                top: 0,
                opacity: 1
            }, this.options.speed, this.options.easing, function(){
            
                //focus
                if($this.box.find(":input:first").length) {
                    $this.box.find(":input:first").focus();
                }
            
            });
            
            $(window).bind('resize.topbox', function(){
                
				$this.center();
				
				$this.overlay.hide().css({
					width: $(document).width(),
					height: $(document).height()
				}).show();
            });
            
            // bind esc
            if(this.options.closeOnEsc){
                $(document).bind('keydown.topbox', function (e) {
                    if (e.keyCode === 27) { // ESC
                        e.preventDefault();
                        $this.close();
                    }
                });
            }
            
            this.showOverlay();
			
            return this;
        },
        
        close: function(){
            
            if(!this.box) {return;}
            
            if(this.options.beforeClose.apply(this)===false){
                return this;
            }
            
            this.overlay.fadeOut();
            
            this.box.animate({ 
                'top'  : ((-1.5) * $this.box.height()),
                'opacity': 0
            }, this.options.speed, this.options.easing, function(){
                $this.clear();
            });
			
			this.options.onClose.apply(this);

            return this;
        },

        blockUI: function(content, options) {
            
            var o = $.extend({
                closeBtn: false,
                closeOnEsc: false
            }, options);
            
            this.show(content, o);
        },
		
		'confirm': function(content, fn, options){

			var defaults = {
				title : UI.topbox.i18n.Confirm,
				buttons: {}
			};

            defaults["buttons"][UI.topbox.i18n.Ok] = function(){ fn.apply($this);};
            defaults["buttons"][UI.topbox.i18n.Cancel] = function(){ this.close();};
			
			this.show(content, $.extend(defaults, options));
		
		},

        'input': function(message, fn, options){
            
            var defaults = {
                title : UI.topbox.i18n.Input,
                value : "",
                buttons: {}
            };

            defaults["buttons"][UI.topbox.i18n.Ok] = function(){
                        
                var val = this.box.find("input[type=text]:first").val();
                fn.apply($this,[val]);
            };

            defaults["buttons"][UI.topbox.i18n.Cancel] = function(){ this.close();};

            var content = '<form class="topbox-input-form">';
                content+= '<div class="topbox-input-message">'+message+'</div>';
                content+= '<input type="text" class="topbox-input" style="width:100%;" />';
                content+= '</form>';

            content = $(content).bind("submit", function(e){
                e.preventDefault();

                UI.topbox.box.find(".topbox-buttons button:first").trigger("click");
            });

            var o = $.extend(defaults, options);

            content.find("input[type=text]:first").val(o.value);

            this.show(content, o);
        
        },
		
		'alert': function(content, options){
			
            var defaults = {
                title : UI.topbox.i18n.Alert,
                buttons: {}
            };

            defaults["buttons"][UI.topbox.i18n.Ok] = function(){ this.close();};
            
            this.show(content, $.extend(defaults, options));
		},
        
        clear: function(){
            
            if(!this.box) {return;}
            
            if (this.persist) {
                this.persist.appendTo(this.persist.data("tb-persist-parent"));
                this.persist = false;
            }
            
            this.box.stop().remove();
            this.box = null;
            
            if(this.overlay){
                this.overlay.hide();
            }
            
            $(window).unbind('resize.topbox');
            $(document).unbind('keydown.topbox');
            
            return this;
        },
		
		center: function(){
			
			if(!this.box) {return;}
			
			this.box.css({
				'left': ($(window).width()/2-$this.box.width()/2)
			});
		},
        
        setTitle: function(title){ 
          
          if(!this.box) {return;}
          
          if(title){
            this.box.find(".topbox-title").html(title).show();
          }else{
            this.box.find(".topbox-title").html(title).hide();
          }
          
          return this;
        },

        setContent: function(content){ 
            
            if(!this.box) {return;}
            
            if (typeof content === 'object') {
				// convert DOM object to a jQuery object
				content = content instanceof jQuery ? content : $(content);
                
                if(content.parent().length) {
                    this.persist = content;
                    this.persist.data("tb-persist-parent", content.parent());
                }
			}
			else if (typeof content === 'string' || typeof content === 'number') {
				// just insert the data as innerHTML
				content = $('<div></div>').html(content);
			}
			else {
				// unsupported data type!
				content = $('<div></div>').html('SimpleModal Error: Unsupported data type: ' + typeof content);
			}
          
            content.appendTo(this.box.find(".topbox-innercontent").html(''));

            return this;
        },
        
        showOverlay: function(){
            
            if(!this.box) {return;}
            
            if(!this.overlay){
                if(!$("#topbox-overlay").length) {
                    $("<div>").attr('id','topbox-overlay').css({
                        top: 0,
                        left: 0,
                        position: 'absolute'
                    }).prependTo('body');
                                        
                }
                
                this.overlay = $("#topbox-overlay");
            }
            
            this.overlay.css({
                width: $(document).width(),
                height: $(document).height()
            }).show();
        }
    };

    UI.topbox.i18n = {
        "Cancel" : "Cancel",
        "Ok"     : "Ok",
        "Confirm": "Please confirm",
        "Input"  : "Please input",
        "Alert"  : "Alert"   
    };

    $.fn.uitopbox = function() {

        var args    = arguments;
        var options = args[0] ? args[0] : {};

        return this.each(function() {
            
			var ele = $(this);
			
			ele.bind("click", function(e) {
				
				e.preventDefault();
				
				var target = String(ele.data('target') || ele.attr("href")),
					type   = ele.data("type") || "html";
				
				//html source
				if(target[0]=="#" || type=="html") {
					UI.topbox.show($(target), options);
				}

			});
        });
    };
})(jQuery, jQuery.baseui);