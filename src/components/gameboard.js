import {WasmWrapper} from "../wasm";
import ReactDOM from "react-dom";
import React from "react";
import Messages from "./Messages";

export default class GameBoard {
  constructor(url) {
    this.build_view = this.build_view.bind(this);
    this.update_view = this.update_view.bind(this);

    this.board = document.getElementById('board');
    this.messages = document.getElementById('messages');
    this.colors = [];
    this.texts = [];
    this.spanNodes = [];
    this.txtNodes = [];

    this.wrapper = new WasmWrapper(url, () => {

      this.build_view(this.wrapper.get_view());
      ReactDOM.render(
        <Messages messages={this.wrapper.get_messages(5)} />,
        this.messages
      );

      window.addEventListener("keypress", (e) => {
        this.wrapper.press_key(e.key);
        this.update_view(this.wrapper.get_view());
        ReactDOM.render(
          <Messages messages={this.wrapper.get_messages(5)} />,
          this.messages
        );
      });
    });
  }

  build_view(view) {
    const color = "#ffffff";
    const txt = " ";
    const spanProto = document.createElement("span");
    const txtNProto = document.createTextNode(txt);
    spanProto.setAttribute("style", `color:${color};`);
    spanProto.appendChild(txtNProto);

    for (const row of view) {
      let colorRow = [];
      let txtRow = [];
      let spanRow = [];
      let txtNRow = [];
      for (const pixel of row) {
        let span = spanProto.cloneNode(true);
        let txtN = span.firstChild;
        let colstr = GameBoard.color(pixel[1]);
        let txtstr = GameBoard.char(pixel[0]);
        spanProto.setAttribute("style", `color:${colstr};`);
        txtN.nodeValue = txtstr;
        colorRow.push(colstr);
        txtRow.push(txtstr);
        spanRow.push(span);
        txtNRow.push(txtN);
        this.board.appendChild(span);
      }
      this.colors.push(colorRow);
      this.texts.push(txtRow);
      this.spanNodes.push(spanRow);
      this.txtNodes.push(txtNRow);
      this.board.appendChild(document.createElement("br"));
    }
  }

  update_view(view) {
    let y = 0;
    for (const row of view) {
      let colorRow = this.colors[y];
      let txtRow = this.texts[y];
      let spanRow = this.spanNodes[y];
      let txtNRow = this.txtNodes[y];
      let x = 0;
      for (const pixel of row) {
        let colstr = GameBoard.color(pixel[1]);
        let txtstr = GameBoard.char(pixel[0]);
        let oldcol = colorRow[x];
        let oldtxt = txtRow[x];

        if (oldtxt !== txtstr) {
          txtNRow[x].nodeValue = txtstr;
          txtRow[x] = txtstr;
        }
        if (oldcol !== colstr) {
          spanRow[x].setAttribute("style", `color:${colstr};`);
          colorRow[x] = colstr;
        }
        x+=1;
      }
      y+=1;
    }
  }
  static color(arr) {
    return "#" + GameBoard.d2h(arr[0]) + GameBoard.d2h(arr[1]) + GameBoard.d2h(arr[2]);
  }
  static d2h(d) {
    const h = (+d).toString(16);
    return h.length === 1 ? '0' + h : h;
  }
  static char(icon) {
    switch (icon) {
      case "Empty":
        return " ";
      case "Player":
        return "@";
      case "Wall":
        return "#";
      case "Floor":
        return ".";
      default:
        return "?";
    }
  }
}