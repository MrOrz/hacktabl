import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import styles from './header.sass';
import upgradeToMdl from '../utils/upgrade';
import PureComponent from 'react-pure-render/component';
import {connectToCurrentTable} from '../utils/connect';
import {PARAGRAPH_TYPE, TABLE_TYPE, CONFIG_TYPE} from '../utils/types'

export class ColumnTitleNav extends PureComponent{
  render() {
    let items = ['Yo'];
    return (
      <nav>
        <ul>
          {items}
        </ul>
      </nav>
    )
  }
}

ColumnTitleNav.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    paragraphs: PropTypes.arrayOf(PARAGRAPH_TYPE),
    children: PropTypes.array
  }))
}

export default class Header extends React.Component {
  render() {
    let title = 'Hacktabl';
    let columnElem = '';

    if(this.props.data && this.props.data.table && this.props.data.config){
      title = this.props.data.config.TITLE || 'Hacktabl';
      columnElem = (
        <ColumnTitleNav columns={this.props.data.table.columns} />
      )
    }

    return (
      <header className="mdl-layout__header">
        <div className="mdl-layout-icon"></div>
        <div className="mdl-layout__header-row">
          <span className="mdl-layout__title">{title}</span>
          <div className="mdl-layout-spacer"></div>
          <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon">
            <i className="material-icons">more_vert</i>
          </button>
        </div>
        <div className={`mdl-layout__header-row ${styles.positionTitle}`}>
          {columnElem}
        </div>
      </header>
    );
  }

  componentDidUpdate() {
    upgradeToMdl(this);
  }
  componentDidMount() {
    upgradeToMdl(this);
  }
}

Header.propTypes = {
  table: TABLE_TYPE,
  config: CONFIG_TYPE
}