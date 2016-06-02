# Datatables-Metadata
Datatables Metadata Plugin - Adds API hooks for column metadata

This plugin is best used in conjunction with `datatables-improved-filters`, which will allow more advanced column specific filtering.

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

- `.meta()` // return all metadata for all columns
- `.meta.clear()` // clear all metadata for all columns
- `.meta.remove(key)` // remove key from all columns metadata

- `.column().meta()` // retrieve meta information for a column
- `.column().meta(key)` // retrieve meta information for a column, under the key `key`
- `.column().meta.replace(data)` // set the entire column meta to the object passed in as `data`
- `.column().meta.clear()` // remove all metadata for this column
- `.column().meta.set(key, data)` // set the `key` property in the column metadata object to `data`
- `.column().meta.merge(key, data)` // merge the `key` property in the column metadata object with the object passed in to `data`
- `.column().meta.remove(key)` // remove all metadata under `key`


### Utility
- `.pick(attr1, attr2, ... attrN)` // similar to `.pluck(),` but returns a new instance of the Datatables API with the result set being an array of objects with the specified keys.  Intended to be used when chained after `.data()` or `.columns().data()` or similar api calls.
- `.pick([attr1, attr2, ... attrN])` // identical to above, but accepts the attributes in an array.  this version will be used if `arguments.length===1` and the first argument is an array.



