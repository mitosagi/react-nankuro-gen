import React, { Component } from 'react';
import './App.css';
import { genarate } from './gen';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

class Cell extends Component {
  render() {
    const text = this.props.text
    let render_text = text
    if (text === "-") {
      render_text = '■'
    } else if (this.props.answer[text] === "") {
      render_text = '　'
    } else {
      render_text = this.props.answer[text]
    }
    return (
      <span className={"Table" + ((text === this.props.selected) ? " selected" : "")} onClick={() => this.props.clicked(text)}>{render_text}</span>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = { data: [], answer: {}, selected: "" };
    /*
  盤面を生成
  行をmapしてから各要素をmapすることでとりあえず盤面を表示する
*/
  }

  async componentDidMount() {
    const arr = await genarate(12)
    const char_set = new Set(arr.reduce((a, b) => a.concat(b)))
    char_set.delete("-")
    const ans = {}
    char_set.forEach(a => ans[a] = a)
    ans[Object.keys(ans)[0]] = ""
    console.log(ans)
    this.setState({ data: arr, answer: ans });
  }

  clicked = (text) => {
    if (text === "-") return
    this.setState({ selected: text })
  }

  onKeyPress = (button) => {
    console.log("Button pressed", button);
  }

  render() {
    const kana50 = [
      "んわらやまぱばはなだたざさがかあ",
      "　ゐり　みぴびひにぢちじしぎきい",
      "　　るゆむぷぶふぬづつずすぐくう",
      "　ゑれ　めぺべへねでてぜせげけえ",
      "　をろよもぽぼほのどとぞそごこお"
    ].map(row => row.split("").join(" ")).concat(["{space}"])
    return (
      <div className="App">
        {this.state.data.map((row, i) =>
          <div key={i}>
            {row.map((square, j) =>
              <Cell key={j} text={square} answer={this.state.answer} clicked={this.clicked} selected={this.state.selected}></Cell>
            )}
          </div>
        )}
        <div className="keyboard">
          <Keyboard onKeyPress={input => this.onKeyPress(input)} layout={{ default: kana50 }}></Keyboard>
        </div>
      </div>
    );
  }
}

export default App;
