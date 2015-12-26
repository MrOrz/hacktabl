import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import styles from './drawer.sass';
import PureComponent from 'react-pure-render/component';
import {connect} from 'react-redux'
import {setUIState} from '../actions'
import {connectToCurrentTable} from '../utils/connect';
import {iterateRows, concatAllParagraphs} from '../utils/traverse';
import upgradeToMdl from '../utils/upgrade';
import {TABLE_TYPE, HEADER_CELL_TYPE, CONFIG_TYPE} from '../utils/types';

class RowTitleItem extends React.Component {
  render () {
    let classNames = ['mdl-js-button mdl-js-ripple-effect', styles.item];

    if(this.props.isTop){
      classNames.push(styles.isTop);
    }

    if(this.props.isActive){
      classNames.push(styles.isActive)
    }

    return (
      <li className={classNames.join(' ')}>
        {this.props.children}
      </li>
    );
  }

  componentDidMount() {
    upgradeToMdl(this);
  }

  componentDidUpdate() {
    upgradeToMdl(this);
  }
}

RowTitleItem = connect()(RowTitleItem)

class RowTitleDivider extends PureComponent {
  render () {
    return (
      <li className={styles.divider}>{this.props.children}</li>
    )
  }
}

class RowTitleNav extends PureComponent {
  render () {
    let items = [];
    let lastDividerText = null;
    let titleItemIdx = 0

    for(let row of iterateRows(this.props.rows)){
      let content = concatAllParagraphs(row.headers[row.headers.length-1]);

      if(row.headers.length > 1){
        let dividerText = row.headers.slice(0, -1).map(
          paragraphs => concatAllParagraphs(paragraphs)).join('／');

        if(dividerText !== lastDividerText){
          items.push(
            <RowTitleDivider key={dividerText}>{dividerText}</RowTitleDivider>
          );
          lastDividerText = dividerText
        }
      }
      items.push(
        <RowTitleItem key={content} isTop={row.headers.length === 1}
                      itemIdx={titleItemIdx}
                      isActive={this.props.activeRowId === titleItemIdx}>
          {content}
        </RowTitleItem>
      )

      titleItemIdx += 1
    }

    return (
      <ul className={styles.list}>
        {items}
      </ul>
    );
  }
}

RowTitleNav.propTypes = {
  rows: PropTypes.arrayOf(HEADER_CELL_TYPE),
  activeRowId: PropTypes.number
};

RowTitleNav.defaultProps = {
  rows: []
};

RowTitleNav = connect(state => ({activeRowId: state.ui.activeRowId}))(RowTitleNav)
export {RowTitleNav}

export default class Drawer extends React.Component {
  render () {
    if(!this.props.config){
      return (
        <div className="mdl-layout__drawer">
          Loading...
        </div>
      )
    }
    let titleElem = "";
    if(this.props.config && this.props.config.TITLE){
      titleElem = <span className={`mdl-layout__title ${styles.title}`}>{this.props.config.TITLE}</span>
    }

    let navElem = "";
    if(this.props.table && this.props.table.rows){
      navElem = (
        <nav className={styles.menu}>
          <RowTitleNav rows={this.props.table.rows} />
        </nav>
      );
    }

    return (
      <div className="mdl-layout__drawer">
        {titleElem}
        {navElem}
      </div>
    );

  }
  componentDidUpdate() {
    upgradeToMdl(this);
  }
  componentDidMount() {
    upgradeToMdl(this);
  }
}

Drawer.propTypes = {
  table: TABLE_TYPE,
  config: CONFIG_TYPE
};
