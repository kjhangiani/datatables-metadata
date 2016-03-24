/** 
 * Metadata + Advanced Filters for Datatables
 * ©2016 Kevin Jhangiani
 *
 * Use the 'M' feature flag on the dom: attribute to initialize MetaData plugin
 * There are no actual dom elements, but the feature flag is used for initialization
 *
 * This plugin adds:
 * Api.column().meta() // retrieve column specific metadata
 * Api.column().meta(@object o) // set column specific metadata to the object parameter (replace)
 * Api.column().meta(@string key, @mixed value) // set the column specific metadata for key to value
 * 
 * Api.column().range(min, max) // set a numeric range filter on a column.  either element can be null
 * Api.column().range() // clear the range filter
 *
 * Api.column().dateRange(min, max) // set a date range filter on a column.  either element can be null.  requires moment.js
 * Api.column().dateRange() // clear the date range filter
 * 
 * Coming soon: Api.column().dateRange(min, max) (requires moment)
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
	.column().meta(object)
	.column().meta(key, value) set key to value
	
	utility fn to retrieve or set column specific state
	this function modifies the settings.columns object of the datatable
	
	if used as a setter, returns this for chaining
	if used as a getter, returns the column state, or null
	
	@todo: not tested against multi table api calls
**/
DataTable.Api.register( 'column().meta()', function() {
	var metadata = this.settings()[0]._metadata;
	
	// we have not loaded the plugin, either return null or this 
	// return value depends on arguments.length, whether this was called as a setter or getter
	if (!metadata) {
		return (!arguments.length ? null : this); 
	} 
	
	var colIndex = this.index();
	var args = Array.prototype.slice.call(arguments);

	//getter
	if (!args.length) {
		if (metadata && metadata.columns && metadata.columns[colIndex]){
			return $.extend(true, {}, metadata.columns[colIndex]);
		} 
		return null;
	}
	
	//setter
	else {
		if (metadata && !metadata.columns) { metadata.columns = []; }
		if (metadata && metadata.columns && !metadata.columns[colIndex]) { metadata.columns[colIndex] = {}; }
		if (metadata && metadata.columns && metadata.columns[colIndex]){
			// set entire metadata object 
			if (args.length === 1) {
				// metadata.columns[colIndex] = $.extend(true, {}, {}, args[0]);
				if (typeof args[0] === 'object') {
					metadata.columns[colIndex] = args[0];
				} 
				else {
					metadata.columns[colIndex] = {};
				}
			}
			// set metadata key to value
			else {
				var metaKey = args[0];
				var metaValue = args[1];
				metadata.columns[colIndex][metaKey] = metaValue;
			}
			
			// save state after saving metadata
			this.state.save();
		} 

		return this;
	}
	
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


/**
	.column().range()
	.column().range(min, max)
	
	sets or clears column specific (numeric) range filter
	utilizes the registered search fn, and depends on the key settings.columns[i].range
	
	uses .column().meta() to store column specific data
	
	if metadata is not initialized, will not do anything
	
	chainable, returns Api
**/
DataTable.Api.register('column().range()', function (lowerBound, upperBound) {
	var colIndex = this.index();
	
	// metadata plugin not loaded, just return
	if (this.settings()[0]._metadataEnabled !== true) { return this; }
	
	// if no parameters, or only a single null parameter, then clear the search state
	if (!arguments.length || (arguments.length === 1 && lowerBound === null)) {
		this.column(colIndex).meta('range', null);
		return this;
	} 
	
	// if we have parameters, set them
	// @todo: validate these values
	this.column(colIndex).meta('range', { min: lowerBound, max: upperBound });
	return this;
});

/**
	.column().dateRange()
	.column().dateRange(min, max)
	
	sets or clears column specific (date) range filter
	utilizes the registered search fn, and depends on the metadata key dateRange
	
	uses .column().meta() to store column specific data
	
	if metadata is not initialized, will not do anything
	
	chainable, returns Api
**/
DataTable.Api.register('column().dateRange()', function (lowerBound, upperBound) {
	var colIndex = this.index();

	// metadata plugin not loaded, just return
	if (this.settings()[0]._metadataEnabled !== true) { return this; }
	
	// if no parameters, or only a single null parameter, then clear the search state
	if (!arguments.length || (arguments.length === 1 && lowerBound === null)) {
		this.column(colIndex).meta('dateRange', null);
		return this;
	} 
	
	// if we have parameters, set them
	// @todo: validate these values
	this.column(colIndex).meta('dateRange', { min: lowerBound, max: upperBound });
	return this;
});



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables Search Hooks
 *
 */
/**
	custom .ext.search for numeric and date range filtering
	uses settings.columns[i].range to compute search
**/
DataTable.ext.search.push(function(settings, searchData, index, rowData, counter) {
	// if metadata is not enabled, skip this search
	if (settings._metadataEnabled !== true) { return true; }
	
	// if we have no metadata, or no columns, then short-circuit true
	var metadata = settings._metadata;
	if (!metadata || !metadata.columns || !metadata.columns.length) { return true; }
	
	var isBoundValid = function(bound) {
		// false, null, and isNaN all exclude the row
		if (bound === null || bound === false || isNaN(bound)) { return false; }
		return true;
	};
	
	var checkRange = function(colData, min, max) {
		if (!isBoundValid(colData)) { return false; }
		
		if ((!isBoundValid(min) && !isBoundValid(max)) ||
				(!isBoundValid(min) && colData <= max) ||
				(min <= colData		&& !isBoundValid(max)) ||
				(min <= colData		&& colData <= max )) {

			return true;
		}
		return false;
	};
	var range;
	var dateRange;
	var dateMin;
	var dateMax;
	
	for (var i=0,ien=metadata.columns.length; i < ien; i++) {
		if (!metadata.columns[i]) { continue; } //skip to next iteration if no metadata on this column
		
		range = metadata.columns[i].range;
		
		if (range && (range.hasOwnProperty('min') || range.hasOwnProperty('max'))) {
			if (!checkRange(searchData[i], range.min, range.max)) {
				// if we fail the check, remove this row
				return false;
			}
			// otherwise, continue checking rows
		}
		
		
		dateRange = metadata.columns[i].dateRange;
		if (moment && dateRange && (dateRange.hasOwnProperty('min') || dateRange.hasOwnProperty('max'))) {
			if (dateRange.hasOwnProperty('min')) { dateMin = moment(dateRange.min).format('x'); }
			else { dateMin = null; }
			
			if (dateRange.hasOwnProperty('max')) { dateMax = moment(dateRange.max).format('x'); }
			else { dateMax = null; }
			
			if (!checkRange(moment(searchData[i]).format('x'), dateMin, dateMax)) {
				// if we fail the date range check, remove this row
				return false;
			}
			// otherwise, continue checking rows
		}
	}
	
	// if we got here, we are good
	return true;
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
