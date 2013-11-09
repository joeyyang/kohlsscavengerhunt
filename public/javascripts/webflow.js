/*!
 * Webflow: Front-end site library
 * Other scripts may access this api using an async handler:
 *   var Webflow = Webflow || [];
 *   Webflow.push(readyFunction);
 */
(function () {
  'use strict';
  
  var $ = window.$;
  var api = {};
  var modules = {};
  var primary = [];
  var secondary = window.Webflow || [];
  var $win = $(window);
  var _ = api._ = underscore();
  var domready = false;
  
  /**
   * Webflow.define() - Define a webflow.js module
   * @param  {string} name
   * @param  {function} init
   */
  api.define = function (name, init) {
    var module = modules[name] = init($, _);
    if (!module) return;
    // Push module ready method into primary queue
    module.ready && primary.push(module.ready);
    // If running in Webflow app, subscribe to design/preview events
    if (api.env()) {
      module.design && window.addEventListener('__wf_design', module.design);
      module.preview && window.addEventListener('__wf_preview', module.preview);
    }
  };
  
  /**
   * Webflow.require() - Load a Webflow.js module
   * @param  {string} name
   * @return {object}
   */
  api.require = function (name) {
    return modules[name];
  };
  
  /**
   * Webflow.push() - Add a ready handler into secondary queue
   * @param {function} ready  Callback to invoke on domready
   */
  api.push = function (ready) {
    // If domready has already happened, invoke handler
    if (domready) {
      $.isFunction(ready) && ready();
      return;
    }
    // Otherwise push into secondary queue
    secondary.push(ready);
  };
  
  /**
   * Webflow.env() - Get the state of the parent Webflow app (if any)
   * @param {string} mode [optional]
   * @return {boolean}
   */
  api.env = function (mode) {
    var designFlag = window.__wf_design;
    var inApp = typeof designFlag != 'undefined';
    if (!mode) return inApp;
    if (mode == 'design') return inApp && designFlag;
    if (mode == 'preview') return inApp && !designFlag;
  };
  
  /**
   * Webflow.script() - Append script to document head
   * @param {string} src
   */
  api.script = function (src) {
    var doc = document;
    var scriptNode = doc.createElement('script');
    scriptNode.type = 'text/javascript';
    scriptNode.src = src;
    doc.getElementsByTagName('head')[0].appendChild(scriptNode);
  };
  
  /**
   * Webflow.resize - Centralized window resize events
   */
  api.resize = function () {
    // Set up throttled resize event
    var handlers = [];
    var udpate = _.throttle(function () {
      _.each(handlers, function (h) { h(); });
    }, 20);
    $win.on('orientationchange.webflow resize.webflow load.webflow', udpate);
    var resize = {};
    /**
     * Add an event handler
     * @param  {function} handler
     */
    resize.on = function (handler) {
      if (typeof handler != 'function') return;
      if (_.contains(handlers, handler)) return;
      handlers.push(handler);
    };
    /**
     * Remove an event handler
     * @param  {function} handler
     */
    resize.off = function (handler) {
      handlers = _.filter(handlers, function (h) {
        return h !== handler;
      });
    };
    return resize;
  }();
  
  // jQuery helper to trigger native DOM redraw events
  if (api.env()) {
    var Event = window.Event;
    var redraw = new Event('__wf_redraw');
    $.fn.redraw = function () {
      return this.each(function () {
        this.dispatchEvent(redraw);
      });
    };
  }
  
  // DOM ready - Call primary and secondary handlers
  $(function () {
    domready = true;
    $.each(primary.concat(secondary), function (index, value) {
      $.isFunction(value) && value();
    });
  });
  
  /*!
   * Webflow._ (aka) Underscore.js 1.5.2 (custom build)
   * _.each
   * _.map
   * _.filter
   * _.any
   * _.contains
   * _.delay
   * _.defer
   * _.throttle
   * _.debounce
   * 
   * http://underscorejs.org
   * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   * Underscore may be freely distributed under the MIT license.
   */
  function underscore() {
    var _ = {};
    
    // Current version.
    _.VERSION = '1.5.2-Webflow';
    
    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
    
    // Create quick reference variables for speed access to core prototypes.
    var
      push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;
    
    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
      nativeForEach      = ArrayProto.forEach,
      nativeMap          = ArrayProto.map,
      nativeReduce       = ArrayProto.reduce,
      nativeReduceRight  = ArrayProto.reduceRight,
      nativeFilter       = ArrayProto.filter,
      nativeEvery        = ArrayProto.every,
      nativeSome         = ArrayProto.some,
      nativeIndexOf      = ArrayProto.indexOf,
      nativeLastIndexOf  = ArrayProto.lastIndexOf,
      nativeIsArray      = Array.isArray,
      nativeKeys         = Object.keys,
      nativeBind         = FuncProto.bind;
    
    // Collection Functions
    // --------------------
    
    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function(obj, iterator, context) {
      /* jshint shadow:true */
      if (obj == null) return;
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
          if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
      } else {
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
          if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
      }
    };
    
    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
      each(obj, function(value, index, list) {
        results.push(iterator.call(context, value, index, list));
      });
      return results;
    };
    
    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function(obj, iterator, context) {
      var results = [];
      if (obj == null) return results;
      if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
      each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) results.push(value);
      });
      return results;
    };
    
    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function(obj, iterator, context) {
      iterator || (iterator = _.identity);
      var result = false;
      if (obj == null) return result;
      if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
      each(obj, function(value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) return breaker;
      });
      return !!result;
    };
    
    // Determine if the array or object contains a given value (using `===`).
    // Aliased as `include`.
    _.contains = _.include = function(obj, target) {
      if (obj == null) return false;
      if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
      return any(obj, function(value) {
        return value === target;
      });
    };
    
    // Function (ahem) Functions
    // --------------------
    
    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function(func, wait) {
      var args = slice.call(arguments, 2);
      return setTimeout(function(){ return func.apply(null, args); }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = function(func) {
      return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };
    
    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _.throttle = function(func, wait, options) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options || (options = {});
      var later = function() {
        previous = options.leading === false ? 0 : new Date;
        timeout = null;
        result = func.apply(context, args);
      };
      return function() {
        var now = new Date;
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    };
    
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      return function() {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function() {
          var last = (new Date()) - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
      };
    };
    
    // Export underscore
    return _;
  }
    
  // Export api
  window.Webflow = api;
}());
/**
 * Webflow: Forms
 */
Webflow.define('webflow-forms', function ($) {
  'use strict';
  
  var $doc = $(document);
  var win = window;
  var loc = window.location;
  var retro = window.XDomainRequest && !window.atob;
  
  function ready() {
    // Handle form submission for Webflow forms
    $doc.on('submit', 'div.w-form form', function(e) {
      _submitForm($(this), e);
    });

    // Alert for disconnected forms
    if ($('div.w-form form').length > 0 && !$('html').data('wf-site')) {
      win.setTimeout(function() {
        window.alert('Oops! This page has a form that is powered by Webflow, but important code was removed that is required to make the form work. Please contact support@webflow.com to fix this issue.');
      });
    }
  }
  
  // Submit form to Webflow
  function _submitForm(form, e) {
    var btn = form.find(':input[type="submit"]'),
      wait = btn.data('wait') || 0,
      test = Webflow.env(),
      data = {
        name: form.data('name') || form.attr('name') || 'Untitled Form',
        source: loc.href,
        test: test,
        fields: {}
      };

    if ($.trim(form.attr('action')) !== '') {
      return;
    }

    e.preventDefault();

    // Find all form fields
    form.find(':input:not([type="submit"])').each(function(i) {
      var fld = $(this),
        name = fld.data('name') || fld.attr('name') || ('Field ' + (i + 1));

      data.fields[name] = fld.val();
    });

    // Disable the submit button
    btn.prop('disabled', true);
    if (wait) {
      btn.data('w-txt', btn.val()).val(wait);
    }

    // Read site ID
    // NOTE: If this site is exported, the HTML tag must retain the data-wf-site attribute for forms to work
    var siteId = $('html').data('wf-site');

    if (siteId) {
      var url = 'https://webflow.com/api/v1/form/' + siteId;

      // Work around same-protocol IE XDR limitation
      if (retro && url.indexOf('https://webflow.com') >= 0) {
        url = url.replace('https://webflow.com/', 'http://data.webflow.com/');
      }

      $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: 'json',
        crossDomain: true
      }).done(function(data) {
        _afterSubmit(form, btn, wait);
      }).fail(function(xhr, status, err) {
        _afterSubmit(form, btn, wait, 1);
      });
    } else {
      _afterSubmit(form, btn, wait, 1);
    }
  }

  // Runs after the AJAX request completes
  function _afterSubmit(form, btn, wait, err) {
    var wrap = form.closest('div.w-form'),
      stat = ['fail', 'done'][err ? 0 : 1];

    if (!err) {
      form.addClass('w-hidden');
    }

    btn.prop('disabled', false);
    if (wait) {
      btn.val(btn.data('w-txt')).removeData('w-txt');
    }

    wrap.find('> div.w-form-' + stat).addClass('w-form-' + stat + '-show');
  }
  
  // jQuery.XDomainRequest.js
  // Jason Moon - @JSONMOON
  var jQuery = $;
  if (!jQuery.support.cors && jQuery.ajaxTransport && window.XDomainRequest) {
    var ActiveXObject = window.ActiveXObject;
    var httpRegEx = /^https?:\/\//i;
    var getOrPostRegEx = /^get|post$/i;
    var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');
    var htmlRegEx = /text\/html/i;
    var jsonRegEx = /\/json/i;
    var xmlRegEx = /\/xml/i;
    
    // ajaxTransport exists in jQuery 1.5+
    jQuery.ajaxTransport('text html xml json', function(options, userOptions, jqXHR){
      // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
      if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
        var xdr = null;
        var userType = (userOptions.dataType||'').toLowerCase();
        return {
          send: function(headers, complete){
            xdr = new window.XDomainRequest();
            if (/^\d+$/.test(userOptions.timeout)) {
              xdr.timeout = userOptions.timeout;
            }
            xdr.ontimeout = function(){
              complete(500, 'timeout');
            };
            xdr.onload = function(){
              var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
              var status = {
                code: 200,
                message: 'success'
              };
              var responses = {
                text: xdr.responseText
              };
              try {
                if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
                  responses.html = xdr.responseText;
                } else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
                  try {
                    responses.json = jQuery.parseJSON(xdr.responseText);
                  } catch(e) {
                    status.code = 500;
                    status.message = 'parseerror';
                    //throw 'Invalid JSON: ' + xdr.responseText;
                  }
                } else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
                  var doc = new ActiveXObject('Microsoft.XMLDOM');
                  doc.async = false;
                  try {
                    doc.loadXML(xdr.responseText);
                  } catch(e) {
                    doc = undefined;
                  }
                  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                    status.code = 500;
                    status.message = 'parseerror';
                    throw 'Invalid XML: ' + xdr.responseText;
                  }
                  responses.xml = doc;
                }
              } catch(parseMessage) {
                throw parseMessage;
              } finally {
                complete(status.code, status.message, responses, allResponseHeaders);
              }
            };
            // set an empty handler for 'onprogress' so requests don't get aborted
            xdr.onprogress = function(){};
            xdr.onerror = function(){
              complete(500, 'error', {
                text: xdr.responseText
              });
            };
            var postData = '';
            if (userOptions.data) {
              postData = (jQuery.type(userOptions.data) === 'string') ? userOptions.data : jQuery.param(userOptions.data);
            }
            xdr.open(options.type, options.url);
            xdr.send(postData);
          },
          abort: function(){
            if (xdr) {
              xdr.abort();
            }
          }
        };
      }
    });
  }
  
  // Export module
  return { ready: ready };
});
/**
 * Webflow: Maps widget
 */
Webflow.define('webflow-maps', function ($) {
  'use strict';
  
  var $doc = $(document);
  var api = {};
  var google;
  var $maps;
  
  // -----------------------------------
  // App preview
  
  api.preview = function () {
    // Update active map nodes
    $maps = $doc.find('.w-widget-map');
    // Listen for resize events
    $maps.length && Webflow.resize.on(updatePreview);
  };
  
  api.design = function () {
    // Stop listening for resize events
    Webflow.resize.off(updatePreview);
  };
  
  function updatePreview() {
    $maps.redraw();
  }
  
  // -----------------------------------
  // Site load
  
  api.ready = function () {
    // Load Maps API on the front-end
    if (!Webflow.env()) initMaps();
  };
  
  function initMaps() {
    $maps = $doc.find('.w-widget-map');
    if ($maps.length) {
      Webflow.script('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=_wf_maps_loaded');
      window._wf_maps_loaded = function () {
        delete window._wf_maps_loaded;
        google = window.google;
        $maps.each(renderMap);
        Webflow.resize.on(function () {
          $maps.each(resizeMap);
        });
      };
    }
  }
  
  // Render map onto each element
  function renderMap(i, el) {
    var data = $(el).data();
    getState(el, data);
  }
  
  // Resize map when window changes
  function resizeMap(i, el) {
    var state = getState(el);
    google.maps.event.trigger(state.map, 'resize');
    state.setMapPosition();
  }
  
  // Store state on element data
  var store = 'w-widget-map';
  function getState(el, data) {
    
    var state = $.data(el, store);
    if (state) return state;
    
    var $el = $(el);
    state = $.data(el, store, {
      // Default options
      latLng: '51.511214,-0.119824',
      tooltip: '',
      style: 'roadmap',
      zoom: 12,
      
      // Marker
      marker: new google.maps.Marker({
        draggable: false
      }),
      
      // Tooltip infowindow
      infowindow: new google.maps.InfoWindow()
    });
    
    // LatLng center point
    var latLng = data.widgetLatlng || state.latLng;
    state.latLng = latLng;
    var coords = latLng.split(',');
    var latLngObj = new google.maps.LatLng(coords[0], coords[1]);
    state.latLngObj = latLngObj;
    
    // Map instance
    state.map = new google.maps.Map(el, {
      center: state.latLngObj,
      zoom: state.zoom,
      maxZoom: 18,
      mapTypeControl: false,
      panControl: false,
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      },
      mapTypeId: state.style
    });
    state.marker.setMap(state.map);
    
    // Set map position and offset
    state.setMapPosition = function () {
      state.map.setCenter(state.latLngObj);
      var offsetX = 0;
      var offsetY = 0;
      var padding = $el.css(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']);
      offsetX -= parseInt(padding.paddingLeft, 10);
      offsetX += parseInt(padding.paddingRight, 10);
      offsetY -= parseInt(padding.paddingTop, 10);
      offsetY += parseInt(padding.paddingBottom, 10);
      state.map.panBy(offsetX, offsetY);
    };
    
    // Fix position after first tiles have loaded
    google.maps.event.addListener(state.map, 'tilesloaded', function () {
      google.maps.event.clearListeners(state.map, 'tilesloaded');
      state.setMapPosition();
    });
    
    // Set initial position
    state.setMapPosition();
    state.marker.setPosition(state.latLngObj);
    state.infowindow.setPosition(state.latLngObj);
    
    // Draw tooltip
    var tooltip = data.widgetTooltip;
    if (tooltip) {
      state.tooltip = tooltip;
      state.infowindow.setContent(tooltip);
      if (!state.infowindowOpen) {
        state.infowindow.open(state.map, state.marker);
        state.infowindowOpen = true;
      }
    }
    
    // Map style - options.style
    var style = data.widgetStyle;
    if (style) {
      state.map.setMapTypeId(style);
    }
    
    // Zoom - options.zoom
    var zoom = data.widgetZoom;
    if (zoom != null) {
      state.zoom = zoom;
      state.map.setZoom(+zoom);
    }
    
    // Click marker to open in google maps
    google.maps.event.addListener(state.marker, 'click', function() {
      window.open('https://maps.google.com/?z=' + state.zoom + '&daddr=' + state.latLng);
    });
    
    return state;
  }
  
  // Export module
  return api;
});
/**
 * Webflow: Smooth scroll
 */
Webflow.define('webflow-scroll', function ($) {
  'use strict';
  
  var $doc = $(document);
  var $body = $(document.body);
  var win = window;
  var loc = win.location;
  
  function ready() {
    // Smooth scroll during page load
    if (loc.hash) {
      _scroll(loc.hash.substring(1));
    }

    // Smooth scroll to page sections
    $doc.on('click', 'a', function(e) {
      if (Webflow.env('design')) {
        return;
      }

      var lnk = this,
        hash = lnk.hash ? lnk.hash.substring(1) : null;

      if (hash) {
        _scroll(hash, e);
      }
    });
  }
  
  function _scroll(hash, e) {
    var n = $('#' + hash);
    if (!n || n.length === 0) {
      return;
    }

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Push new history state
    if (loc.hash !== hash && win.history && win.history.pushState) {
      win.history.pushState(null, null, '#' + hash);
    }

    // Adjust for fixed header
    var header = $('header');
    header = header.length ? header : $body.children(':first');
    var h = header.length ? header.get(0) : null;
    var styles = null;

    if (h) {
      if (win.getComputedStyle) {
        styles = win.getComputedStyle(h, null);
      } else if (h.currentStyle) {
        styles = h.currentStyle; // IE8
      }
    }

    var fixed = styles && styles['position'] == 'fixed',
      offset = fixed ? header.outerHeight() : 0;

    // Smooth scroll
    if (e) {
      _smooth(n, offset);
    } else {
      win.setTimeout(function() {
        _smooth(n, offset);
      }, 300);
    }
  }
  
  function _smooth(n, offset, cb){
    var w = window,
      start = $(w).scrollTop(),
      end = n.offset().top - offset,
      clock = Date.now(),
      animate = w.requestAnimationFrame || w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame || function(fn) { window.setTimeout(fn, 15); },
      duration = 472.143 * Math.log(Math.abs(start - end) +125) - 2000,
      step = function() {
        var elapsed = Date.now() - clock;

        w.scroll(0, _pos(start, end, elapsed, duration));

        if (elapsed > duration) {
          if (cb) {
            cb(n);
          }
        } else {
          animate(step);
        }
      };

    step();
  }
  
  function _pos(start, end, elapsed, duration) {
    if (elapsed > duration) {
      return end;
    }

    return start + (end - start) * _ease(elapsed / duration); 
  }
  
  function _ease(t) {
    return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
  }
  
  // Export module
  return { ready: ready };
});
