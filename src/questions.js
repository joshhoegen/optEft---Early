// http://localhost:8080/
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import mexp from 'math-expression-evaluator';

import { getRandomInt, getEquation, getTimeNow, getTimeTotal } from './utils/utils';
import config from './data/config'
import messages from './data/messages';
import equations from './data/mockEquations';

const subjectId = 1;
const sessionId = Math.floor(Date.now() / 1000);

// OptEft(trial,1)=trial; % Uniquie ID
// OptEft(trial,2)=level(trial); % 1 - noLimit
// OptEft(trial,3)=sum(Numbers); % Expected Value
// OptEft(trial,4)=str2num(string1); % Response Value
// OptEft(trial,5)=accuracy(trial); %1 = accurate, 0 = wrong, 8 = deadline, 9 = deadline + no numeric level
// OptEft(trial,6)=RT; % time
// {
//   session: 1,
//   questionID: 1,
//   EndTime: 4124213213,
//   Responses: [{
//     equation: '24 + 1'
//     trial: 1,
//     level: 2,
//     expectedValue: 25,
//     responseValue: 24,
//     responseTime: 1000
//   }],
//   Data: {
//     equations: []
//   }
// }

// Moved to utils. Leaving for algorithm
function generateEquation() {
  // ADD WEIGHTED CORRECT COUNT TO BOTTOM OF RANGE?
  // Need to figure out babe's algorithm.
  // Default:
  // TwoDigitRange = [10:1:99]; // 2 digit numbers should be selected from this range

  // OneDigitRange = [1:1:9]; // 1 digit numbers should be selected from this range
  // % pick two digit numbers for the first summands. If the level is an odd
  // % number, then divide it by 2 and then add one. That means, even number
  // % levels will have as many 2 digit numbers to sum as their level number
  // % minus one. If it's an odd number level, then also add a one digit number
  // % as the last summand
  // ALWAYS 2? = length(TwoDigitRange)?
  // Numbers=[

  //    TwoDigitRange(randi(length(TwoDigitRange), floor(level(trial)/2)+1,1))
  //    OneDigitRange(randi(length(OneDigitRange), mod(level(trial),2),1))
  // ];
  // Numbers = [
  //   TwoDigitRange(
  //     randi(
  //       length(TwoDigitRange),
  //       floor(level[trial] / 2) + 1,
  //       1
  //     )
  //   ),
  //   OneDigitRange(
  //     randi(
  //       length(OneDigitRange),
            // if level of difficulty
  //       mod(level[trial], 2),
  //       1
  //     )
  //   )
  // ];

  // Dif60=1;
  // sdev=.5;
  // Dif60 = floor(mean(Results.Subject(subjectId).Capacity.Responses(length(Results.Subject(subjectId).Capacity.Responses) - (round(length(Results.Subject(subjectId).Capacity.Responses)/4)):end,2)));
  // sdev = std(Results.Subject(subjectId).Capacity.Responses(length(Results.Subject(subjectId).Capacity.Responses)-(round(length(Results.Subject(subjectId).Capacity.Responses)/4)):end,2));

}

function saveSession(id, data) {
  // Save results. Need to organize by ParticipantID, SessionId, answers
  // Should save before each form reset
  console.log(data);
  localStorage.setItem(id, JSON.stringify(data));
}

class Questions extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string
  };

  static defaultProps = {
    placeholder: ''
  };

  constructor(props) {
    super(props);

    this.playing = true;
    this.trialData = {
      session: 0,
      endTime: 0,
      responses: [], // See: saveResponseData
      level: 0,
    };
    this.count = 0;
    this.state = {
      answer: '',
      equation: getEquation(),
      message: messages.welcome,
      // First equationStart not accurate sonce needs "Play" button to start
      equationStart: null
    };
    saveSession(sessionId, this.trialData);
  };

  saveResponseData(props) {
    const {
      equation,
      trial,
      expectedValue,
      responseValue,
      responseTime,
      accuracy
    } = props;

    this.trialData.responses.push({
      equation: equation,
      trial: trial,
      expectedValue: expectedValue,
      responseValue: responseValue,
      responseTime: getTimeTotal(this.state.equationStart, getTimeNow()),
      accuracy: accuracy
    });

    saveSession(sessionId, this.trialData);
  }

  componentDidMount() {
    this.form = ReactDOM.findDOMNode(this).getElementsByTagName('form')[0];
    this.newQuestion();
  }

  // TODO: Move to utils and accept second param (equation)
  checkMath(answer) {
    if (mexp.eval(this.state.equation) === parseInt(answer)) {
      return true;
    }
    return false;
  }

  handleSubmit(evt) {
    evt.preventDefault();
    const form = this.form;
    const input = form.getElementsByTagName('input')[0];
    const answer = new FormData(form).get('answer');
    let accuracy = 9;
    let level = 0;
    let isTrue = this.checkMath(answer);
    let message = '';

    this.setState({answer: answer});
    clearTimeout(this.timer);

    if(answer && isTrue) {
      message = 'responseCorrect';
      accuracy = 1;
      level = 0.5;
    } else {
      message = 'responseWrong';
      accuracy = 0;
      level = -0.5;
    }

    // Reset Form and hide
    form.reset();
    input.setAttribute('disabled', 'disabled');
    this.setState({
      message: messages[message]
    });

    // TODO: Reuse mexp, expectedVal, etc
    // TODO: Better organize formData save. See deadline()
    this.saveResponseData({
      equation: this.state.equation,
      expectedValue: mexp.eval(this.state.equation),
      responseValue: answer,
      responseTime: getTimeTotal(this.state.equationStart, getTimeNow()),
      accuracy: accuracy,
      trial: this.count
    });
    this.trialData.level += level;

    // Present new question after answerResponseDuration
    setTimeout(this.newQuestion.bind(this), config.answerResponseDuration);
  }

  deadline() {
    console.log('DEADLINE REACHED');
    // TODO: Better organize formData save. See handleSubmit()
    this.saveResponseData({
      equation: this.state.equation,
      expectedValue: mexp.eval(this.state.equation),
      responseValue: null,
      responseTime: null,
      accuracy: 8
    });
    this.newQuestion();
  }

  pause() {
    this.playing = false;
    clearTimeout(this.timer);
  }

  play() {
    this.playing = true;
    this.timer = setTimeout(this.deadline.bind(this), config.answerDuration);
  }

  newQuestion() {
    const input = this.form.getElementsByTagName('input')[0];
    this.count += 1;

    // Re-eneable Form
    input.removeAttribute('disabled');
    input.focus();
    this.setState({
      answer: '',
      equation: getEquation(),
      message: messages.default,
      equationStart: getTimeNow()
    });
    this.timer = setTimeout(this.deadline.bind(this), config.answerDuration);
  }

  togglePlay() {
    return this.playing ? this.pause() : this.play()
  }

  render() {
    const {
      equation, message
    } = this.state;

    return (
      <div>
        <div className="default-state">
          <p>+</p>
          <button
            onClick={this.togglePlay.bind(this)}
            onKeyPress={this.togglePlay.bind(this)}>
              {this.playing ? 'Pause' : 'Start'}
          </button>

        </div>
        <h1 style={{
          color: `${message.color}`
        }} className="message">{message.text}</h1>
        <form className="prompt" onSubmit={this.handleSubmit.bind(this)}>
          <h2 className="equation">{equation}</h2>
          <input
            id="answer" name="answer" type="number"
            placeholder="Type here..."
            onKeyPress={(evt) => {
              // Only allow digits + Enter/Return
              if ((evt.which < 48 || evt.which > 57) && evt.which !==  13) {
                evt.preventDefault();
              }
            }}/>
        </form>
      </div>
    );
  }
}

export default Questions;
