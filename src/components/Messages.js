import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Messages extends Component {
  render() {
    let msg_list = [];
    for (const msg of this.props.messages) {
      msg_list.push(msg);
      msg_list.push(<br/>);
    }
    msg_list.pop();

    return (
      <div style={{
        margin: "0",
        display: "inline-block",
        color: "white",
        fontFamily: "monospace",
        verticalAlign: "top"
      }}>
        {msg_list}
      </div>
    );
  }
}

Messages.propTypes = {};
Messages.defaultProps = {};

export default Messages;
