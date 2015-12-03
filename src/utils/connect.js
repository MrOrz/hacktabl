import {connect} from 'react-redux';

export const connectToCurrentTable = connect(state => state.tables[state.currentTableId] || {});