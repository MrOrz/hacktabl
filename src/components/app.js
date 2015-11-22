import React from 'react';
import styles from './app.sass';

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
    componentHandler.upgradeElement(React.findDOMNode(this));
  }
}

class Drawer extends React.Component {
  render () {
    return (
      <div className="mdl-layout__drawer">
        <span className="mdl-layout__title">Hi</span>
        Drawer!
      </div>
    );
  }
  componentDidUpdate() {
    componentHandler.upgradeElement(React.findDOMNode(this));
  }
}

class Footer extends React.Component {
  render () {
    return (
      <footer className={`mdl-mini-footer ${styles.footer}`}>
        <div className="mdl-mini-footer__left-section">
          <div className="mdl-logo">Hacktabl</div>
          <ul className="mdl-mini-footer__link-list">
            <li><a href="">About this table</a></li>
            <li><a href="">Edit the table</a></li>
          </ul>
        </div>
        <div className={`mdl-mini-footer__right-section ${styles.footerRight}`}>
          Hacktabl. g0v Project.
        </div>
      </footer>
    );
  }
  componentDidUpdate() {
    componentHandler.upgradeElement(React.findDOMNode(this));
  }
}

export default class App extends React.Component {
  render() {
    return (
      <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-drawer">
        <Header />
        <Drawer />
        <main className="mdl-layout__content">
          {this.props.children}
        </main>
        <Footer />
      </div>
    );
  }

  componentDidUpdate() {
    componentHandler.upgradeElement(React.findDOMNode(this));
  }
}

