import * as React from "react";
import * as ReactDOM from "react-dom";

class CardChecker extends React.Component<{}, {}>
{
  render() {
    return <p>I'm here</p>
  }
}

ReactDOM.render(<CardChecker />, document.getElementsByTagName( 'div' )[ 0 ]);