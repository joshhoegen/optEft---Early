// http://localhost:8080/
import React from 'react';
import {
  render
} from 'react-dom';

import Questions from './questions';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      message: 'Welcome to OptEft',

    };
  }

  render() {
    return ( <div >
      <Questions />
    </div>
    );
  }
}

render( < App / > , document.getElementById('app'));
