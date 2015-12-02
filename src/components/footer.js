import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './footer.sass';

import {connect} from 'react-redux';

class Footer extends React.Component {
  render () {
    return (
      <footer className={`mdl-mini-footer ${styles.root}`}>
        <div className="mdl-mini-footer__left-section">
          <div className="mdl-logo">Hacktabl</div>
          <ul className="mdl-mini-footer__link-list">
            <li><a href="">About this table</a></li>
            <li><a href="">Edit the table</a></li>
          </ul>
        </div>
        <div className={`mdl-mini-footer__right-section ${styles.copyright}`}>
          Hacktabl. g0v Project.
        </div>
      </footer>
    );
  }
  componentDidUpdate() {
    componentHandler.upgradeElement(findDOMNode(this));
  }
}

export default connect(state => state)(Footer);