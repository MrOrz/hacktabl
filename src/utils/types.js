import {PropTypes} from 'react';

export const RUN_PROPS = {
  text: PropTypes.string.isRequired,
  commentIds: PropTypes.arrayOf(PropTypes.string),
  isB: PropTypes.bool, isU: PropTypes.bool, isI: PropTypes.bool
}

export const RUN_TYPE = PropTypes.shape(RUN_PROPS)

export const HYPERLINK_PROPS = {
  href: PropTypes.string.isRequired,
  runs: PropTypes.arrayOf(RUN_TYPE).isRequired
}

export const HYPERLINK_TYPE = PropTypes.shape(HYPERLINK_PROPS)

export const PARAGRAPH_PROPS = {
  level: PropTypes.number.isRequired,
  children: PropTypes.arrayOf(PropTypes.oneOfType([RUN_TYPE, HYPERLINK_TYPE])).isRequired,

  // These exists only in table items
  //
  labels: PropTypes.arrayOf(PropTypes.string),
  reference: PropTypes.arrayOf(PropTypes.oneOfType([RUN_TYPE, HYPERLINK_TYPE]))
}

export const PARAGRAPH_TYPE = PropTypes.shape(PARAGRAPH_PROPS);

export const DATA_CELL_PROPS = {
  items: PropTypes.arrayOf(PARAGRAPH_TYPE),
  summaryParagraphs: PropTypes.arrayOf(PARAGRAPH_TYPE)
}

export const DATA_CELL_TYPE = PropTypes.shape(DATA_CELL_PROPS);

export const HEADER_CELL_PROPS = {
  paragraphs: PropTypes.arrayOf(PARAGRAPH_TYPE),
  children: PropTypes.array, // For table row & column header cells
  cells: PropTypes.arrayOf(DATA_CELL_TYPE) // For leaf table row header
}

export const HEADER_CELL_TYPE = PropTypes.shape(HEADER_CELL_PROPS);

export const TABLE_TYPE = PropTypes.shape({
  columns: PropTypes.arrayOf(HEADER_CELL_TYPE).isRequired,
  rows: PropTypes.arrayOf(HEADER_CELL_TYPE).isRequired,
  commentMap: PropTypes.object // Key-value pair
});

export const CONFIG_TYPE = PropTypes.object;

export const TABLE_DATA_TYPE = PropTypes.shape({
  config: CONFIG_TYPE,
  table: TABLE_TYPE
})

export const TABLE_WITH_META_TYPE = PropTypes.shape({
  data: TABLE_DATA_TYPE,
  isFetching: PropTypes.bool,
  lastFetchedAt: PropTypes.number
});