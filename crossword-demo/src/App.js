import React, { Component } from 'react';
import './App.scss';
import { get_crossword, kana_kanji_dict, str_kuromasu } from './gen';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const number_of_char_types = 15;
const number_of_un_filled_char_types = 6;
const kana50 = [
  "わらゃやまぱばはなだたざさがかあ",
  "をり　　みぴびひにぢちじしぎきい",
  "んるゅゆむぷぶふぬづつずすぐくう",
  "ーれ　　めぺべへねでてぜせげけえ",
  "っろょよもぽぼほのどとぞそごこお"
].map(row => row.split("").join(" ")).concat(["{space}"])
const game_desc = `1. 同時に点灯するマスには同じ文字、しないマスには違う文字をいれてクロスワードを完成させてください。
2. すべての単語は「ニコニコ大百科」「ピクシブ百科事典」それぞれに存在する単語にならないといけません。
3. 「ぁ、ぃ、ぅ、ぇ、ぉ、ゎ」は、それぞれ「あ、い、う、え、お、わ」に対応します。`

class Cell extends Component {
  render() {
    const text = this.props.text
    let render_text = text
    let color = "black"
    let box = false
    if (text === str_kuromasu) {
      render_text = '■'
      box = true
    } else if (this.props.char_hint[text] !== "") {
      render_text = this.props.char_hint[text]
    } else if (this.props.char_ans[text] !== "") {
      render_text = this.props.char_ans[text]
      color = "blue"
    }else{
      render_text = "　"
    }
    return (
      <span className={"Table" + ((text === this.props.char_selected) ? " selected" : "") + ((color === "blue") ? " blue" : "") + ((box) ? " box" : "")}
        onClick={() => this.props.clicked(text)}>{render_text}</span>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = { cw_board: [], char_hint: {}, char_ans: {}, char_selected: "", solved: false, dict_link: [["", ""], ["", ""]] };
  }

  async componentDidMount() {
    const [cw_board, char_set] = await get_crossword(number_of_char_types)

    const char_hint = {}
    const char_ans = {}
    char_set.forEach(a => {
      char_hint[a] = a
      char_ans[a] = ""
    })

    for (let i = 0; i < number_of_un_filled_char_types; i++) {
      char_hint[Object.keys(char_hint)[i]] = ""
    }

    this.setState({ cw_board: cw_board, char_hint: char_hint, char_ans: char_ans });
  }

  mouseEnter = (i, j) => {
    const column = JSON.parse(JSON.stringify(this.state.cw_board[i]))
    column[j] = column[j] + "a"
    const match_c = column.join("").match(/^.*?-*([ぁ-わをんー]*)a([ぁ-わをんー]*)-*.*$/)

    const row = JSON.parse(JSON.stringify(this.state.cw_board.map(col => col[j])))
    row[i] = row[i] + "a"
    const match_r = row.join("").match(/^.*?-*([ぁ-わをんー]*)a([ぁ-わをんー]*)-*.*$/)

    let dict = [match_c[1] + match_c[2], match_r[1] + match_r[2]]
    dict = dict.map(d => (d.length <= 1) ? ["", ""] : [`${d} 【${kana_kanji_dict[d]}】`, `https://dic.nicovideo.jp/a/${kana_kanji_dict[d]}`])
    this.setState({ dict_link: dict })
  }

  clicked = (text) => {
    if (text === str_kuromasu || this.state.char_hint[text] !== "") return
    this.setState({ char_selected: text })
  }

  onKeyPress = (button) => {
    if (button === "　" || button === "{space}") button = ""
    this.setState(state => {
      state.char_ans[this.state.char_selected] = button
      let solved = true
      for (const [key, value] of Object.entries(state.char_hint)) {
        if (value === "" && state.char_ans[key] !== key) solved = false
      }
      state.solved = solved
      return state
    })
  }

  render() {
    return (
      <div className="App">
        <div className="center">
          <p className="desc">
            {game_desc}
          </p>
          <div className={"column" + ((this.state.solved) ? " complete" : "")}>
            {this.state.cw_board.map((row, i) =>
              <div key={i} className={"row"}>
                {row.map((square, j) =>
                  <span className={"item"} onMouseEnter={() => this.mouseEnter(i, j)}>
                    <Cell key={j} text={square} char_hint={this.state.char_hint} char_ans={this.state.char_ans} clicked={this.clicked} char_selected={this.state.char_selected}></Cell>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="keyboard">
            <Keyboard onKeyPress={input => this.onKeyPress(input)} layout={{ default: kana50 }}
              buttonTheme={[
                {
                  class: "disabled",
                  buttons: Object.values(this.state.char_hint).join(" ")
                },
                {
                  class: "disabled_ans",
                  buttons: Object.values(this.state.char_ans).join(" ")
                }
              ]}></Keyboard>
          </div>
          <div><a href={this.state.dict_link[0][1]}>{"ヨコ: " + this.state.dict_link[0][0]}</a></div>
          <div><a href={this.state.dict_link[1][1]}>{"タテ: " + this.state.dict_link[1][0]}</a></div>
        </div>
      </div>
    );
  }
}

export default App;
