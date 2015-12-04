import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import styles from './header.sass';
import upgradeToMdl from '../utils/upgrade';
import PureComponent from 'react-pure-render/component';
import {iterateColumnHeaders, concatAllParagraphs} from '../utils/traverse';
import {TABLE_CELL_TYPE, TABLE_TYPE, CONFIG_TYPE} from '../utils/types'

class ColumnTitleNav extends PureComponent{
  render() {
    let items = [];
    let lastAncestorText = null;

    for(let column of iterateColumnHeaders(this.props.columns)) {
      let ancestorText = column.slice(0, -1).map(
        paragraphs => concatAllParagraphs(paragraphs)).join('／');
      let content = concatAllParagraphs(column[column.length-1]);

      if(ancestorText && ancestorText !== lastAncestorText) {
        items.push(<li key={`${ancestorText}-${content}`}>{ancestorText}<br/>{content}</li>)
        lastAncestorText = ancestorText;
      } else {
        items.push(<li key={content}>{content}</li>)
      }
    }

    return (
      <ul className={styles.columnHeaderNav}>
        {items}
      </ul>
    );
  }
}

ColumnTitleNav.propTypes = {
  columns: PropTypes.arrayOf(TABLE_CELL_TYPE)
}

export default class Header extends React.Component {
  render() {
    let title = 'Hacktabl';
    let columnElem = '';

    if(this.props.table && this.props.config){
      title = this.props.config.TITLE || 'Hacktabl';
      columnElem = (
        <ColumnTitleNav columns={this.props.table.columns} />
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
        <div className={`mdl-layout__header-row ${styles.positionRow}`}>
          <div style={{
            transform: `translate3d(-${this.props.scrollLeft}px, 0, 0)`
          }}>
            {columnElem}
          </div>
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