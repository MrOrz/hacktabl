import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './header.sass';

import {connect} from 'react-redux';

class Header extends React.Component {
  render() {
    return (
      <header className="mdl-layout__header">
        <div className="mdl-layout-icon"></div>
        <div className="mdl-layout__header-row">
          <span className="mdl-layout__title">Hacktabl</span>
          <div className="mdl-layout-spacer"></div>
          <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon">
            <i className="material-icons">more_vert</i>
          </button>
        </div>
        <div className={`mdl-layout__header-row ${styles.positionTitle}`}>
          Some tabs!!
        </div>
      </header>
    );
  }

  componentDidUpdate() {
    componentHandler.upgradeElement(findDOMNode(this));
  }
}

export default connect(state => state)(Header);