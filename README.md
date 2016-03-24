# Datatables-Metadata
Datatables Metadata Plugin - Adds API hooks for column metadata, as well as advanced range filters.

# Installation

Install the package via bower.

```
bower install datatables-metadata
```

# Configuration

Enable the extension in your environment via the `M` feature flag to Datatables.  

This plugin does not render any dom elements, so it's placement in the feature flag list does not matter.  The feature flag is used to instantiate the plugin.

```
$('#myTable').DataTable( {
  dom: 'lrtipM'
});

```

# Usage

This plugin provides the following additional API calls:

### Metadata

Store column specific metadata in the datatable.  This is used by the filtering functions below, but can also be used to store arbitrary data related to the column as required.  This data is state saved if state saving is enabled.

- `.column().meta()` // retrieve meta information for a column
- `.column().meta(obj)` // set the metadata for a column to the specified object (replaces any existing metadata)
- `.column().meta(key, data)` // set the `key` property in the column metadata object to `data`

### Numeric Range Filters

- `.column().range(min, max)` // numeric range filtering for a column.  either min or max can be `null` to enable one sided filtering
- `.column().range()` // clear numeric range filters on this column

### Date Range Filters (requires moment.js)

- `.column().dateRange(min, max)` // date range filtering for a column.  either min or max can be `null` to enable one sided filtering.  Values can be strings (parsed via moment.js) or JS date objects
- `.column().range()` // clear date range filters on this column


### Utility
- `.pick(attr1, attr2, ... attrN)` // similar to .pluck(), but returns a new instance of the Datatables API with the result set being an array of objects with the specified keys.  Intended to be used when chained after `.data()` or `.columns().data()` or similar api calls.
- `.pick([attr1, attr2, ... attrN])` // identical to above, but accepts the attributes in an array.  this version will be used if `arguments.length===1` and the first argument is an array.



