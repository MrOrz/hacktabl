import React from 'react';
import styles from './home-page.sass';
import {Link} from 'react-router';

export default class HomePage extends React.Component {
  render() {
    return (
      <div>
        <h1>Hello world!</h1>
        <Link to="/president2017/item/xxx">president2017 Item</Link>
        <Link to="/president2017">president2017</Link>
        <Link to="/president2016">president2016</Link>
        <Link to="/">home</Link>
      </div>
    )
  }
};