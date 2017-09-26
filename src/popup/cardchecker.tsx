import * as React from "react";
import * as ReactDOM from "react-dom";
import * as cardValidator from "card-validator";

function exists<T>(e: T): boolean
{
  return typeof e != 'undefined' && e != null;
}

interface ICardCheckerState
{
  CardNumber: string;
  Validation?: cardValidator.validNumber;
}

class CardChecker extends React.Component<{}, ICardCheckerState>
{
  state: ICardCheckerState; // a hack to allow state mutability which is prohibited by react typings

  constructor()
  {
    super();
    this.state = { CardNumber: "" };
  }

  updateState: (e: React.ChangeEvent<HTMLInputElement>) => boolean = e =>
  {
    this.state.CardNumber = e.target.value.replace(/[\s-]/g, '');
    this.state.Validation = cardValidator.number(this.state.CardNumber);
    this.setState(this.state);
    return true;
  }

  isValidated: () => boolean = () => exists(this.state.Validation);
  isRecognized: () => boolean = () => this.isValidated() && exists(this.state.Validation.card);

  applyGaps: () => string = () =>
  {
    let gaps = this.state.Validation.card.gaps;
    let original = this.state.CardNumber;
    let num = "";
    let lastGap = 0;
    console.log(original.length);
    for (var i = 0; i < gaps.length; i++)
    {
      let currentGap = gaps[i];
      if (currentGap >= original.length) {
        if (lastGap == 0)
          num = original;
        break;
      }
      num += original.substring(lastGap, currentGap);
      lastGap = currentGap;
      console.log(lastGap);
      if (lastGap != original.length)
        num += ' ';
    }
    if (lastGap > 0)
      num += original.substring(lastGap);
    return num;
  }

  render() {
    // todo: submit a pull request to card-validator, see https://support.worldpay.com/support/kb/bg/testandgolive/tgl5103.html
    // for now the check is simplified resulting in less precise card validation.
    // Airplus cards aren't recognized at all
    let validityState =
      this.isValidated() && this.state.Validation.isPotentiallyValid && this.state.CardNumber.length >= 13 // minimal possible length (visa cards)
        ? "valid"
        : this.isValidated() && !this.state.Validation.isPotentiallyValid
          ? "invalid"
          : "none";
    return <div className={validityState}>
      <input onChange={this.updateState} placeholder="enter card number here" value={this.isRecognized() && this.state.Validation.card.gaps ? this.applyGaps() : this.state.CardNumber} />
      <p>{this.isRecognized() ? this.state.Validation.card.niceType : null}</p>
    </div>
  }
}

ReactDOM.render(<CardChecker />, document.getElementsByTagName( 'div' )[ 0 ]);