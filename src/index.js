// Global styles
require('material-design-lite/src/material-design-lite.scss');
require('./sass/index.sass');

// Material JS
require('material-design-lite/material');

import ReactDOM from 'react-dom';
import App from './components/app';

ReactDOM.render(<App />, document.getElementById('react-root'));