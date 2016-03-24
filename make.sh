#!/bin/sh

# copied from datatables-buttons repo

OUT_DIR=$1
DEBUG=$2

# Change into script's own dir
cd $(dirname $0)

DT_SRC=$(dirname $(dirname $(pwd)))
DT_BUILT="${DT_SRC}/built/DataTables"
. $DT_SRC/build/include.sh

# Copy CSS
# rsync -r css $OUT_DIR
# css_frameworks buttons $OUT_DIR/css

# Copy images
#rsync -r images $OUT_DIR

# Copy JS
rsync -r js $OUT_DIR
js_compress $OUT_DIR/js/dataTables.metadata.js
js_frameworks metadata $OUT_DIR/js

# Copy and build examples
# rsync -r examples $OUT_DIR
# examples_process $OUT_DIR/examples

# SWF file flash export options
# rsync -r swf $OUT_DIR

# Readme and license
cp README.md $OUT_DIR
cp LICENSE $OUT_DIR

