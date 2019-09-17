import React from 'react';
import PropTypes from 'prop-types';

class Input extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string
  };

  static defaultProps = {placeholder: ''};

  constructor() {
    super();

    this.state = {value: ''};
  }

  render(props) {
    const {value} = this.state;
    const {placeholder} = this.props;
    console.log(props);
    // onKeyPress prevents nonNumeric vals.
    // onChange saves the answer. Can be used to eval on timeout if need-be.
    return (
      <input
        id="answer" name="answer" type="number"
        placeholder={placeholder}
        onKeyPress={(e) => {
          if ((e.which < 48 || e.which > 57) && e.which !==  13) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const val = e.target.value;
          // this.props.onChange
          this.setState({
            value: val
          });
        }}
        value={value}
      />
    );
  }
}

export default Input;
