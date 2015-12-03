import {PropTypes} from 'react';

export const PARAGRAPH_TYPE = PropTypes.shape({
  children: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string
  })).isRequired
});