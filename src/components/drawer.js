import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import styles from './drawer.sass';
import PureComponent from 'react-pure-render/component';
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

class RowTitleDivider extends PureComponent {
  render () {
    return (
      <li className={styles.divider}>{this.props.children}</li>
    )
  }
}


export class RowTitleNav extends PureComponent {
  render () {
    let items = [];
    let lastDividerText = null;

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
        <RowTitleItem key={content} isTop={row.headers.length === 1}>
          {content}
        </RowTitleItem>
      )

    }


    return (
      <ul className={styles.list}>
        {items}
      </ul>
    );

    function traverse(rows, titleStack) {
      rows.forEach((row) => {
        if(row.children){ // Has children, not in the most detailed header yet
          titleStack.push(row);
          traverse(row.children, titleStack);
          titleStack.pop();
        }else{ // All row header is inside titleStack

          // Print delimiter if the header is nested and not previously printed
          // yet.
          //
          if(titleStack.length > 0 && lastTitleHeader !== titleStack[titleStack.length-1]){
            items.push(
              <RowTitleDivider key={""+Math.random()} headers={titleStack.slice(0)} />
            );
            lastTitleHeader = titleStack[titleStack.length-1];
          }

          items.push(
            <RowTitleItem key={""+Math.random()} paragraphs={row.paragraphs} isTop={titleStack.length === 0}/>
          )
        }
      })
    }
  }
}

RowTitleNav.propTypes = {
  rows: PropTypes.arrayOf(HEADER_CELL_TYPE)
};

RowTitleNav.defaultProps = {
  rows: []
};

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
