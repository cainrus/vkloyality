import * as React from "react";
import * as ReactDOM from "react-dom";
import axios from "axios";

import './cardchecker.less';

interface i18n
{
  getMessage(messageName: string, substitutions?: any): string;
}

interface chrome
{
  i18n: i18n;
}

declare const chrome: chrome;

function exists<T>(e: T): boolean
{
  return typeof e != 'undefined' && e != null;
}

interface ICardCheckerState
{
  IsChecking: boolean;
  IsSwindler: string;
  IsNotSwindler?: boolean;
  CardNumber: string;
  error?: any;
}

class CardChecker extends React.Component<{}, ICardCheckerState>
{
  state: ICardCheckerState; // a hack to allow state mutability which is prohibited by react typings

  getDefaultState: () => ICardCheckerState = () => ({ CardNumber: "", IsChecking: false, IsSwindler: null });

  inputId: string = "main_input";
  detailsId: string = "details_href";

  constructor()
  {
    super();
    this.state = this.getDefaultState();
  }

  updateState: (e: React.ChangeEvent<HTMLInputElement>) => boolean = e =>
  {
    this.state.CardNumber = e.target.value.replace(/[\s-\(\)_]/g, '');
    this.state.IsChecking = false;
    this.state.IsSwindler = null;
    this.state.IsNotSwindler = false;
    this.setState(this.state);
    return true;
  }

  focusInput: () => void = () =>
  {
    document.getElementById(this.inputId).focus();
  }

  componentDidMount()
  {
    this.focusInput();
  }

  checkIfSwindler: (e: React.MouseEvent<HTMLButtonElement>) => boolean = e =>
  {
    this.state.IsChecking = true;
    this.setState(this.state);

    axios.create().get('https://api.vk.com/method/board.getComments?group_id=104169151&topic_id=32651912&need_likes=0&offset=0&count=1&extended=0&v=5.68', { timeout: 2000 })
      .then(response => {
        console.log(response);
        interface IQuery {
          From: number;
          Count: number;
        }
        let queries : IQuery[] = [];
        for (let i = -1; true; i++)
        {
          let from = i >= 0 ? queries[i].From + queries[i].Count : 1;
          let to = (response.data.response.count as number) - from;
          if (to == NaN) throw new Error("Invalid response");
          to = to > 100 ? 100 : to;
          if (to <= 0)
            break;
          queries.push({ From: from, Count: to });
        }
        console.log(queries);
        
        Promise
          .all(queries.map(q => axios.create().get(`https://api.vk.com/method/board.getComments?group_id=104169151&topic_id=32651912&need_likes=0&offset=${q.From}&count=${q.Count}&extended=0&v=5.68`, { timeout: 2000 })))
          .then(response => {
            console.log(response);
            let invalid: boolean[] = response.map(r => r.data.response.items.push as boolean).filter(b => !b);
            console.log(invalid);
            if (invalid.length > 0)
              throw new Error("Invalid response");

            let comments: any[] = response.map(r => r.data.response.items).reduce((a, b) => a.concat(b));
            console.log(comments);
            let warning = comments
              .map(comment => ({Comment: comment, Index: comment.text.indexOf(this.state.CardNumber)}))
              .filter(candidate => candidate.Index >= 0)
              .filter(candidate => candidate.Index == 0 || candidate.Comment.text[candidate.Index - 1] == '\n')
              .filter(candidate => candidate.Comment.text.length == candidate.Index + this.state.CardNumber.length
                || candidate.Comment.text[candidate.Index + this.state.CardNumber.length] == '\n')
              .map(candidate => candidate.Comment);
            console.log(warning);
            if (warning.length > 0)
            {
              this.state.IsSwindler = `https://vk.com/topic-104169151_32651912?post=${warning[0].id}`;
              setTimeout(() => document.getElementById(this.detailsId).focus(), 150);
            }
            else
              this.state.IsNotSwindler = true;
            this.state.IsChecking = false;
            this.setState(this.state);
          })
          .catch(e => {
            console.log(e);
            this.state.error = e;
            this.setState(this.state);
          });
      })
      .catch(e => {
        console.log(e);
        this.state.error = e;
        this.setState(this.state);
      } ); 
    return true;
  }

  resetState: () => void = () =>
  {
    this.state = this.getDefaultState();
    this.setState(this.state);
    setTimeout(this.focusInput, 100);
  }

  render() {
    return this.state.error
      ? <div>
        <p className="error">{chrome.i18n.getMessage("popup_error", this.state.error.message)}<a href='https://vk.com/b.geor'>{chrome.i18n.getMessage("popup_error_author")}</a></p>
        <button onClick={this.resetState}>{chrome.i18n.getMessage("popup_button_try_again")}</button>
        </div>
      : <form>
          <input onChange={this.updateState} id={this.inputId} placeholder={chrome.i18n.getMessage("popup_input_placeholder")} value={this.state.CardNumber} readOnly={this.state.IsChecking} />
        {this.state.IsSwindler != null
          ? <div>
            <h3 className="swindler">{chrome.i18n.getMessage("popup_attention_swindler")}</h3>
            <a href={this.state.IsSwindler} id={this.detailsId} target="_blank">{chrome.i18n.getMessage("popup_attention_learn_more")}</a>
          </div>
          : this.state.IsNotSwindler === true
            ? <h3 className="notSwindler">{chrome.i18n.getMessage("popup_not_swindler")}</h3>
            : this.state.IsChecking
              ? <div className="throbber"><div></div></div>
              : <button onClick={this.checkIfSwindler} role="submit">{chrome.i18n.getMessage("popup_button_check")}</button>}
    </form>
  }
}

ReactDOM.render(<CardChecker />, document.getElementsByTagName( 'div' )[ 0 ]);