import * as React from "react";
import * as ReactDOM from "react-dom";

function exists<T>(e: T): boolean
{
  return typeof e != 'undefined' && e != null;
}

interface ICardCheckerState
{
  IsChecking: boolean;
  IsSwindler: string;
  CardNumber: string;
}

class CardChecker extends React.Component<{}, ICardCheckerState>
{
  state: ICardCheckerState; // a hack to allow state mutability which is prohibited by react typings

  constructor()
  {
    super();
    this.state = { CardNumber: "", IsChecking: false, IsSwindler: null };
  }

  updateState: (e: React.ChangeEvent<HTMLInputElement>) => boolean = e =>
  {
    this.state.CardNumber = e.target.value.replace(/[\s-]/g, '');
    this.state.IsChecking = false;
    this.state.IsSwindler = null;
    this.setState(this.state);
    return true;
  }

  checkIfSwindler: (e: React.MouseEvent<HTMLButtonElement>) => boolean = e =>
  {
    this.state.IsChecking = true;
    this.setState(this.state);
    return true;
  }

  render() {
    return <div>
        <input onChange={this.updateState} placeholder="enter payment props to check here" value={this.state.CardNumber} readOnly={this.state.IsChecking} />
        {this.state.IsSwindler != null
          ? <div>
            <h3>Warning: swindler found</h3>
            <a href={this.state.IsSwindler} target="_blank">Learn more...</a>
            <button onClick={this.resetState}>Check another</button>
          </div>
          : this.state.IsChecking
            ? <p> throbber here</p>
            : <button onClick={this.checkIfSwindler} role="button">Check</button>}
    </div>
  }
}

ReactDOM.render(<CardChecker />, document.getElementsByTagName( 'div' )[ 0 ]);