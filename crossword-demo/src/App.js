import React, { Component } from 'react';
import './App.scss';
import { genarate, reverse_dict } from './gen';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

class Cell extends Component {
  render() {
    const text = this.props.text
    let render_text = text
    let color = "black"
    let box = false
    if (text === "-") {
      render_text = '■'
      box = true
    } else if (this.props.question[text] !== "") {
      render_text = this.props.question[text]
    } else {
      render_text = this.props.answer[text]
      if (render_text === "") render_text = "　"
      color = "blue"
    }
    return (
      <span className={"Table" + ((text === this.props.selected) ? " selected" : "") + ((color === "blue") ? " blue" : "") + ((box) ? " box" : "")}
        onClick={() => this.props.clicked(text)}>{render_text}</span>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = { data: [], question: {}, answer: {}, selected: "", complete: false, disabled_key: [], dict_link: [["", ""], ["", ""]] };
  }

  async componentDidMount() {
    const arr = await genarate(15)
    const char_set = new Set(arr.reduce((a, b) => a.concat(b)))
    char_set.delete("-")
    const question = {}
    const answer = {}
    char_set.forEach(a => {
      question[a] = a
      answer[a] = ""
    })

    for (let i = 0; i < 6; i++) {
      question[Object.keys(question)[i]] = ""
    }

    const disabled_key = Object.values(question)
    console.log(disabled_key)

    this.setState({ data: arr, question: question, answer: answer, disabled_key: disabled_key });
  }

  mouseEnter = (i, j) => {
    const column = JSON.parse(JSON.stringify(this.state.data[i]))
    column[j] = column[j] + "a"
    const match_c = column.join("").match(/^.*?-*([ぁ-わをんー]*)a([ぁ-わをんー]*)-*.*$/)

    const row = JSON.parse(JSON.stringify(this.state.data.map(col => col[j])))
    row[i] = row[i] + "a"
    const match_r = row.join("").match(/^.*?-*([ぁ-わをんー]*)a([ぁ-わをんー]*)-*.*$/)

    let dict = [match_c[1] + match_c[2], match_r[1] + match_r[2]]
    dict = dict.map(d => (d.length <= 1) ? ["", ""] : [`${d} 【${reverse_dict[d]}】`, `https://dic.nicovideo.jp/a/${reverse_dict[d]}`])
    this.setState({ dict_link: dict })
  }

  clicked = (text) => {
    if (text === "-" || this.state.question[text] !== "") return
    this.setState({ selected: text })
  }

  onKeyPress = (button) => {
    if (button === "　" || button === "{space}") button = ""
    this.setState(state => {
      state.answer[this.state.selected] = button
      let complete = true
      for (const [key, value] of Object.entries(state.question)) {
        if (value === "" && state.answer[key] !== key) complete = false
      }
      state.complete = complete
      return state
    })
  }

  render() {
    const kana50 = [
      "わらゃやまぱばはなだたざさがかあ",
      "をり　　みぴびひにぢちじしぎきい",
      "んるゅゆむぷぶふぬづつずすぐくう",
      "ーれ　　めぺべへねでてぜせげけえ",
      "っろょよもぽぼほのどとぞそごこお"
    ].map(row => row.split("").join(" ")).concat(["{space}"])
    return (
      <div className="App">
        <div className="center">
          <p>
            {"1. 同時に点灯するマスには同じ文字、しないマスには違う文字をいれてクロスワードを完成させてください。"}<br />
            {"2. すべての単語は「ニコニコ大百科」「ピクシブ百科事典」それぞれに存在する単語にならないといけません。"}<br />
            {"3. 「ぁ、ぃ、ぅ、ぇ、ぉ、ゎ」は、それぞれ「あ、い、う、え、お、わ」に対応します。"}
          </p>
          <div className={"column" + ((this.state.complete) ? " complete" : "")}>
            {this.state.data.map((row, i) =>
              <div key={i} className={"row"}>
                {row.map((square, j) =>
                  <span className={"item"} onMouseEnter={() => this.mouseEnter(i, j)}>
                    <Cell key={j} text={square} question={this.state.question} answer={this.state.answer} clicked={this.clicked} selected={this.state.selected}></Cell>
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
                  buttons: this.state.disabled_key.join(" ")
                },
                {
                  class: "disabled_ans",
                  buttons: Object.values(this.state.answer).join(" ")
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
