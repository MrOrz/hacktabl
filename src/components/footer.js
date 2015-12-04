import React from 'react';
import {findDOMNode} from 'react-dom';
import styles from './footer.sass';
import upgradeToMdl from '../utils/upgrade';

import {connect} from 'react-redux';

class Footer extends React.Component {
  render () {
    return (
      <footer className={`mdl-mini-footer ${styles.root}`} style={{
        transform: `translate3d(${this.props.scrollLeft}px,0,0)`
      }}>
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
    upgradeToMdl(this);
  }
  componentDidMount() {
    upgradeToMdl(this);
  }
}

export default connect(state => state)(Footer);