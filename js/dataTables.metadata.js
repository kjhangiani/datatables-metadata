/** 
 * Metadata for Datatables
 * ©2016 Kevin Jhangiani
 *
 * Use the 'M' feature flag on the dom: attribute to initialize MetaData plugin
 * There are no actual dom elements, but the feature flag is used for initialization
 *
 * This plugin simply stores column specific metadata, that persists with state saving.
 * The primary use of this plugin is in conjunction with datatables-improved-filters which allow column specific filtering
 *
 * This plugin adds:
 * .column().meta()
 * .column().meta(key)
 * .column().meta.replace(object)
 * .column().meta.set(key, value) set key to value
 * .column().meta.merge(key, value) merge value into key
 * .column().meta.clear() null entire meta
 * .column().meta.remove(key) remove key from meta
 *
 * currently, value should always be an object
 *
 * .pick(attr1, attr2, ... attrN)
 * .pick([attr1, attr2, ... attrN]) return a new API instance with the specified keys in an object in each index
 *  similar to pluck, but for multiple arguments
 *
 */
 
// polyfill Array.prototype.fill from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
if (!Array.prototype.fill) {
  Array.prototype.fill = function(value) {

    // Steps 1-2.
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0;

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = start >> 0;

    // Step 8.
    var k = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined ?
      len : end >> 0;

    // Step 11.
    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len);

    // Step 12.
    while (k < final) {
      O[k] = value;
      k++;
    }

    // Step 13.
    return O;
  };
}


(function( factory ){
  if ( typeof define === 'function' && define.amd ) {
    // AMD
    define( ['jquery', 'datatables.net'], function ( $ ) {
      return factory( $, window, document );
    } );
  }
  else if ( typeof exports === 'object' ) {
    // CommonJS
    module.exports = function (root, $) {
      if ( ! root ) {
        root = window;
      }

      if ( ! $ || ! $.fn.dataTable ) {
        $ = require('datatables.net')(root, $).$;
      }

      return factory( $, root, root.document );
    };
  }
  else {
    // Browser
    factory( jQuery, window, document );
  }
}(function( $, window, document, undefined ) {
'use strict';
var DataTable = $.fn.dataTable;


// Used for namespacing events added to the document by each instance, so they
// can be removed on destroy
// copied from Buttons extension, unneeded at this time
var _instCounter = 0;

var _dtMetaData = DataTable.ext.metadata;



/**
 * @param {[type]}
 * @param {[type]}
 */
var MetaData = function(dt, config) {
  this.s = {
    dt: new DataTable.Api(dt),
    namespace: 'dtmd'+(_instCounter++)
  };

  this._constructor();
};


$.extend( MetaData.prototype, {
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Public methods
   */ 
  /**
   * Destroy the instance
   * elements
   */
  destroy: function(){
    //unbind events?
  
    return this;
  },


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Constructor
   */

  /**
   * MetaData constructor
   * @private
   */
  _constructor: function() {
    var that = this;
    var dt = this.s.dt;
    var dtSettings = dt.settings()[0];
    
    // restore saved state if any exists
    var loadedState = dt.state.loaded();
    if (loadedState) { loadedState = $.extend(true, {}, {}, loadedState); }
    
    if (loadedState && loadedState.metadata) {
      dtSettings._metadata = loadedState.metadata;
    }
    
    // otherwise, a clean initialization
    if (!dtSettings._metadata) {
      // dtSettings._metadata = $.extend(true, {}, this.s.metadata);
      
      dtSettings._metadata = {};
      
      // apparently, doing .fill with {} as the parameter makes the entire array reference the same object
      // changed to null to alleviate this
      dtSettings._metadata.columns = new Array(dtSettings.aoColumns.length).fill(null);
    }
    
    // plugin is enabled (for short-circuiting search)
    dtSettings._metadataEnabled = true;

    // bind events
    
    // on destroy, cleanup
    dt.on('destroy.dt', function () {
      that.destroy();
    });
    
    // on save, add the metadata to the state
    dt.on('stateSaveParams.dt', function(e, settings, data) {
      if (settings._metadataEnabled) {
        data.metadata = $.extend(true, {}, {}, settings._metadata); //deep copy?
      }
    });
  }

});



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Statics
 */


/**
 * MetaData defaults.
 * @type {Object}
 * @static
 */
MetaData.defaults = {
  columns: [],
};

MetaData._initData = function(metaObj, index) {
  if (!metaObj[index]) { metaObj[index] = {}; }
  
  return metaObj[index];
};

MetaData._getData = function(metaObj, index) {
  if (!metaObj || !metaObj[index]) { return null; }
  return $.extend(true, {}, {}, metaObj[index]);
};

MetaData._getKeyData = function(metaObj, index, key) {
  var meta = MetaData._getData(metaObj, index);
  if (meta && meta.hasOwnProperty(key)) { 
    return $.extend(true, {}, {}, meta[key]);
  }
  return null;
};

MetaData._clearData = function(metaObj, index) {
  var meta = MetaData._initData(metaObj, index);
  meta = null;
};

MetaData._replaceData = function(metaObj, index, data) {
  var meta = MetaData._initData(metaObj, index);
  meta = $.extend(true, {}, {}, data);
};

MetaData._setKeyData = function(metaObj, index, key, data) {
  var meta = MetaData._initData(metaObj, index);
  meta[key] = $.extend(true, {}, {}, data);
};

MetaData._mergeKeyData = function(metaObj, index, key, data) {
  var meta = MetaData._initData(metaObj, index);
  if (!meta.hasOwnProperty(key)) { meta[key] = {}; }
  
  meta[key] = $.extend(true, {}, meta[key], data);
};

MetaData._removeKeyData = function(metaObj, index, key) {
  var meta = MetaData._initData(metaObj, index);
  if (meta && meta.hasOwnProperty(key)) {
    delete meta[key];
  }
};

/**
 * Version information
 * @type {string}
 * @static
 */
MetaData.version = '0.3.0';


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables API Hooks
 *
 */

 
 /**
  .column().meta()
  .column().meta(key)
  .column().meta.replace(object)
  .column().meta.set(key, value) set key to value
  .column().meta.merge(key, value) merge value into key
  .column().meta.clear() null entire meta
  .column().meta.remove(key) 
  
  @todo: not tested against multi table api calls
**/
DataTable.Api.register( 'column().meta()', function() {
  var metadata = this.settings()[0]._metadata;
  
  // we have not loaded the plugin, return null
  if (!metadata) {
    return null;
  } 
  
  var colIndex = this.index();
  var args = Array.prototype.slice.call(arguments);

  //getter
  if (!args.length) {
    return MetaData._getData(metadata.columns, colIndex);
  }
  else {
    return MetaData._getKeyData(metadata.columns, colIndex, args[0]);
  } 
});

DataTable.Api.register( 'column().meta.replace()', function(replaceData) {
  var metadata = this.settings()[0]._metadata;
  
  // we have not loaded the plugin, either return null or this 
  // return value depends on arguments.length, whether this was called as a setter or getter
  if (!metadata) {
    return this;
  } 
  
  var colIndex = this.index();  
  MetaData._replaceData(metadata.columns, colIndex, replaceData);
  
  return this;  
});

DataTable.Api.register( 'column().meta.set()', function(key, data) {
  var metadata = this.settings()[0]._metadata;
  
  // we have not loaded the plugin, return this to chain
  if (!metadata) {
    return this;
  } 
  
  var colIndex = this.index();  
  MetaData._setKeyData(metadata.columns, colIndex, key, data);
  
  return this;  
});

DataTable.Api.register( 'column().meta.merge()', function(key, data) {
  var metadata = this.settings()[0]._metadata;
  
  // we have not loaded the plugin, return this to chain
  if (!metadata) {
    return this;
  } 
  
  var colIndex = this.index();  
  MetaData._mergeKeyData(metadata.columns, colIndex, key, data);
  
  return this;  
});

DataTable.Api.register( 'column().meta.remove()', function(key) {
  var metadata = this.settings()[0]._metadata;
  
  // we have not loaded the plugin, return this to chain
  if (!metadata) {
    return this;
  } 
  
  var colIndex = this.index();
  MetaData._removeKeyData(metadata.columns, colIndex, key);
  
  return this;  
});

DataTable.Api.register( 'column().meta.clear()', function() {
  var metadata = this.settings()[0]._metadata;
  
  // we have not loaded the plugin, return this to chain
  if (!metadata) {
    return this;
  } 
  
  var colIndex = this.index();
  MetaData._clearData(metadata.columns, colIndex);
  
  return this;  
});


/**
  .pick(arg1, arg2, arg3...argN)
  
  return a new Api instance with the arguments passed in as the keys
  similar to pluck, but accepts multiple keys to extract, and returns objects
**/
DataTable.Api.register( 'pick()', function() {
  var item;
  var args = Array.prototype.slice.call(arguments);
  
  // support [] as first parameter
  if (args.length === 1 && $.isArray(args[0])) {
    args = args[0];
  }

  return this.map(function(value, i) {
    item = {};
    args.forEach(function(prop) {
      item[prop] = value[prop];
    });
    
    return item;
  });
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interface
 */

// Attach to DataTables objects for global access
$.fn.dataTable.MetaData = MetaData;
$.fn.DataTable.MetaData = MetaData;

// DataTables `dom` feature option
DataTable.ext.feature.push({
  fnInit: function(settings) {
    var api = new DataTable.Api( settings );
    var opts = {};

    var adv = new MetaData( api, opts );
    return null;
  },
  
  // enable with 'M' feature flag
  cFeature: "M"
  
});


return MetaData;
}));
