require('../sass/app.sass');

import React from 'react';

class App extends React.Component {
  render() {
    return (
      <div className="demo-layout mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
        <header className="demo-header mdl-layout__header mdl-color--grey-100 mdl-color-text--grey-600">
          <div className="mdl-layout__header-row">
            <span className="mdl-layout-title">Home</span>
            <div className="mdl-layout-spacer"></div>
            <div className="mdl-textfield mdl-js-textfield mdl-textfield--expandable">
              <label className="mdl-button mdl-js-button mdl-button--icon" for="search">
                <i className="material-icons">search</i>
              </label>
              <div className="mdl-textfield__expandable-holder">
                <input className="mdl-textfield__input" type="text" id="search" />
                <label className="mdl-textfield__label" for="search">Enter your query...</label>
              </div>
            </div>
            <button className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" id="hdrbtn">
              <i className="material-icons">more_vert</i>
            </button>
            <ul className="mdl-menu mdl-js-menu mdl-js-ripple-effect mdl-menu--bottom-right" for="hdrbtn">
              <li className="mdl-menu__item">About</li>
              <li className="mdl-menu__item">Contact</li>
              <li className="mdl-menu__item">Legal information</li>
            </ul>
          </div>
        </header>
        <div className="demo-drawer mdl-layout__drawer mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
          <header className="demo-drawer-header">
            <img src="images/user.jpg" className="demo-avatar" />
            <div className="demo-avatar-dropdown">
              <span>hello@example.com</span>
              <div className="mdl-layout-spacer"></div>
              <button id="accbtn" className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon">
                <i className="material-icons" role="presentation">arrow_drop_down</i>
                <span className="visuallyhidden">Accounts</span>
              </button>
              <ul className="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="accbtn">
                <li className="mdl-menu__item">hello@example.com</li>
                <li className="mdl-menu__item">info@example.com</li>
                <li className="mdl-menu__item"><i className="material-icons">add</i>Add another account...</li>
              </ul>
            </div>
          </header>
          <nav className="demo-navigation mdl-navigation mdl-color--blue-grey-800">
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">home</i>Home</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">inbox</i>Inbox</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">delete</i>Trash</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">report</i>Spam</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">forum</i>Forums</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">flag</i>Updates</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">local_offer</i>Promos</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">shopping_cart</i>Purchases</a>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">people</i>Social</a>
            <div className="mdl-layout-spacer"></div>
            <a className="mdl-navigation__link" href=""><i className="mdl-color-text--blue-grey-400 material-icons" role="presentation">help_outline</i><span className="visuallyhidden">Help</span></a>
          </nav>
        </div>
        <main className="mdl-layout__content mdl-color--grey-100">
          <div className="mdl-grid demo-content">
            <div className="demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
            </div>
            <div className="demo-graphs mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
            </div>
            <div className="demo-cards mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-grid mdl-grid--no-spacing">
              <div className="demo-updates mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--4-col-tablet mdl-cell--12-col-desktop">
                <div className="mdl-card__title mdl-card--expand mdl-color--teal-300">
                  <h2 className="mdl-card__title-text">Updates</h2>
                </div>
                <div className="mdl-card__supporting-text mdl-color-text--grey-600">
                  Non dolore elit adipisicing ea reprehenderit consectetur culpa.
                </div>
                <div className="mdl-card__actions mdl-card--border">
                  <a href="#" className="mdl-button mdl-js-button mdl-js-ripple-effect">Read More</a>
                </div>
              </div>
              <div className="demo-separator mdl-cell--1-col"></div>
              <div className="demo-options mdl-card mdl-color--deep-purple-500 mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--3-col-tablet mdl-cell--12-col-desktop">
                <div className="mdl-card__supporting-text mdl-color-text--blue-grey-50">
                  <h3>View options</h3>
                  <ul>
                    <li>
                      <label for="chkbox1" className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
                        <input type="checkbox" id="chkbox1" className="mdl-checkbox__input" />
                        <span className="mdl-checkbox__label">Click per object</span>
                      </label>
                    </li>
                    <li>
                      <label for="chkbox2" className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
                        <input type="checkbox" id="chkbox2" className="mdl-checkbox__input" />
                        <span className="mdl-checkbox__label">Views per object</span>
                      </label>svg
                    </li>
                    <li>
                      <label for="chkbox3" className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
                        <input type="checkbox" id="chkbox3" className="mdl-checkbox__input" />
                        <span className="mdl-checkbox__label">Objects selected</span>
                      </label>
                    </li>
                    <li>
                      <label for="chkbox4" className="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
                        <input type="checkbox" id="chkbox4" className="mdl-checkbox__input" />
                        <span className="mdl-checkbox__label">Objects viewed</span>
                      </label>
                    </li>
                  </ul>
                </div>
                <div className="mdl-card__actions mdl-card--border">
                  <a href="#" className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--blue-grey-50">Change location</a>
                  <div className="mdl-layout-spacer"></div>
                  <i className="material-icons">location_on</i>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

React.render(<App />, document.getElementById('react-root'));