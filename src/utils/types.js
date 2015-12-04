import {PropTypes} from 'react';

export const PARAGRAPH_TYPE = PropTypes.shape({
  children: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string
  })).isRequired
});

export const TABLE_CELL_TYPE = PropTypes.shape({
  paragraphs: PropTypes.arrayOf(PARAGRAPH_TYPE).isRequired,
  children: PropTypes.array, // For table row & column header cells
  cells: PropTypes.array // For leaf table row header
});

export const TABLE_TYPE = PropTypes.shape({
  columns: PropTypes.arrayOf(TABLE_CELL_TYPE).isRequired,
  rows: PropTypes.arrayOf(TABLE_CELL_TYPE).isRequired,
  commentMap: PropTypes.object // Key-value pair
});

export const CONFIG_TYPE = PropTypes.object;

export const TABLE_WITH_META_TYPE = PropTypes.shape({
  data: PropTypes.shape({
    config: CONFIG_TYPE,
    table: TABLE_TYPE
  }),
  isFetching: PropTypes.bool.isRequired,
  lastFetchedAt: PropTypes.number.isRequired
});