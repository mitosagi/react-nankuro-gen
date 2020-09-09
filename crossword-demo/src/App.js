import React, { Component } from 'react';
import './App.css';
import { genarate } from './gen';
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
    this.state = { data: [], question: {}, answer: {}, selected: "", complete: false, disabled_key: [] };
  }

  async componentDidMount() {
    const arr = await genarate(25)
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
        {this.state.data.map((row, i) =>
          <div key={i} className={"row" + ((this.state.complete) ? " complete" : "")}>
            {row.map((square, j) =>
              <Cell key={j} text={square} question={this.state.question} answer={this.state.answer} clicked={this.clicked} selected={this.state.selected}></Cell>
            )}
          </div>
        )}
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
      </div>
    );
  }
}

export default App;
