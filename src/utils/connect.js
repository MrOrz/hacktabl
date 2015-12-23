import {connect} from 'react-redux';
import {TABLE_WITH_META_TYPE} from './types'

// Add propTypes check & connect to store.
// current table data is associated with this.props.currentTable.
//
export function connectToCurrentTable(Component){
  Component.propTypes = Object.assign({}, Component.propTypes, {
    currentTable: TABLE_WITH_META_TYPE.isRequired
  })

  return connect(state => ({
    currentTable: state.tables[state.currentTableId] || {}
  }))(Component)
};