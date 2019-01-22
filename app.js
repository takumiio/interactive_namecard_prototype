import React from "react";
import ReactDOM from "react-dom";
import "./style.sass";

const API_ENDPOINT = "http://api.proto.namecard.takumi.io";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.scale_ratio = 1.5;
    this.context = null;
    this.generated_ref = React.createRef();
    this.canvas_ref = React.createRef();
    this.namecard_image_ref_1 = React.createRef();
    this.namecard_image_ref_2 = React.createRef();
    this.namecard_image_ref_3 = React.createRef();
    this.first_focus_form = React.createRef();
    this.state = {
      full_width_for_canvas: 300,  // dummy value.
      full_height_for_canvas: 300, // dummy value.
      has_loaded_img: false,
      current_selected_image: "namecard_image_ref_1",
      name: "",
      company: "",
      tel: "",
      email: "",
      company_x: 90,
      company_y: 65,
      name_x: 90,
      name_y: 95,
      tel_x: 130,
      tel_y: 130,
      email_x: 130,
      email_y: 147,
    };
  }

  l_draw(img) {
    // TODO: Maybe has problem. This is memory leak. Need survey and release canvas contents
    const context = this.l_get_context();
    context.clearRect(0, 0, this.state.full_width_for_canvas, this.state.full_height_for_canvas);
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.scale(this.scale_ratio, this.scale_ratio)
    if ( this.state.has_loaded_img ) {
      context.drawImage(img, this.l_relative_x_from_center(0), this.l_relative_y_from_center(0));
    } else {
      img.onload = () => {
        context.drawImage(img, this.l_relative_x_from_center(0), this.l_relative_y_from_center(0));
        this.setState({
          has_loaded_img: true,
        });
      }
    }
    context.beginPath();
    context.font = '16px "游ゴシック体", YuGothic';

    this.l_font_color_prod_or_placeholder(this.state.company);
    context.fillText(this.state.company || "takumi.io", this.l_relative_x_from_center(this.state.company_x) , this.l_relative_y_from_center(this.state.company_y));
    this.l_font_color_prod_or_placeholder(this.state.name);
    context.fillText(this.state.name    || "西村 拓美", this.l_relative_x_from_center(this.state.name_x)    , this.l_relative_y_from_center(this.state.name_y));
    context.font = '12px "游ゴシック体", YuGothic';
    this.l_font_color_prod_or_placeholder(this.state.tel);
    context.fillText(this.state.tel     || "070-4461-0414", this.l_relative_x_from_center(this.state.tel_x)   , this.l_relative_y_from_center(this.state.tel_y));
    this.l_font_color_prod_or_placeholder(this.state.email);
    context.fillText(this.state.email   || "takumi@nishimura.io", this.l_relative_x_from_center(this.state.email_x) , this.l_relative_y_from_center(this.state.email_y));
    context.stroke();
  }

  async l_request_to_create_namecard() {

    const canvas_dom = this.canvas_ref.current;
    const namecard_dataurl = canvas_dom.toDataURL();
    const body = {
      namecard_image: namecard_dataurl,
    }
    const options = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    };

    const response = await fetch(`${API_ENDPOINT}/namecard_requesting`, options);
    const json = await response.json();

    if ( json.message == "is OK" ) {
      alert("名刺の作成を依頼しました");
    } else {
      alert("どうやらエラーのようです…＼(^o^)／");
    }

    /*
    if ( this.state.company &&
         this.state.name    &&
         this.state.tel     &&
         this.state.email ) {

    }
    */
  }

  l_font_color_prod_or_placeholder(v) {
    const context = this.l_get_context();
    if ( v ) {
      if ( this.state.current_selected_image === "namecard_image_ref_3" ) {
        context.fillStyle = "white";
      } else {
        context.fillStyle = "black";
      }
    } else {
      context.fillStyle = "#ccc";
    }
  }

  l_get_context() {
    return this.canvas_ref.current.getContext("2d");
  }

  l_handle_on_click_namecard_bg(index, e) {
    let img = this.namecard_image_ref_1.current;
    switch (index) {
      case 2:
        img = this.namecard_image_ref_2.current;
        this.setState({
          current_selected_image: "namecard_image_ref_2",
        }, () => { this.l_draw(img) });
        break;
      case 3:
        img = this.namecard_image_ref_3.current;
        this.setState({
          current_selected_image: "namecard_image_ref_3",
        }, () => { this.l_draw(img) });
        break;
      default:
        this.setState({
          current_selected_image: "namecard_image_ref_1",
        }, () => { this.l_draw(img) });
    }
  }

  handle_on_change_input_form(key, e) {
    const update_obj = {};
    update_obj[key] = e.target.value;
    this.setState( update_obj );
  }

  handle_on_change_input_form_with_only_number_constraint(key, e) {
    const val = e.target.value;
    const update_obj = {};
    if ( val === "" ) {
      update_obj[key] = 0;
      this.setState( update_obj );
    } else if ( val.match(/[0-9]+/) ) {
      update_obj[key] = Number.parseInt(e.target.value);
      this.setState( update_obj );
    }
  }

  componentDidMount() {
    // Set canvas size. Can not set with CSS.
    const canvas_wrapper_width = this.generated_ref.current.clientWidth;
    const canvas_wrapper_height = this.generated_ref.current.clientHeight;
    this.setState({
      full_width_for_canvas: canvas_wrapper_width,
      full_height_for_canvas: canvas_wrapper_height,
    });
  }

  l_relative_x_from_center(pos) {
    return (this.state.full_width_for_canvas / this.scale_ratio) / 2 - (258 / 2) + pos;
  }
  l_relative_y_from_center(pos) {
    return (this.state.full_height_for_canvas / this.scale_ratio ) / 2 - (156 / 2) + pos;
  }

  componentDidUpdate() {
    let img = this.namecard_image_ref_1.current;
    if ( this.state.current_selected_image === "namecard_image_ref_2" ) {
      img = this.namecard_image_ref_2.current;
    }
    if ( this.state.current_selected_image === "namecard_image_ref_3" ) {
      img = this.namecard_image_ref_3.current;
    }
    this.l_draw(img);
  }


  render() {
    return (
      <div
        className="Root_App"
      >
        <header
          className="Root_App__1 Header"
        >
          <h1
            className="Header__title"
          >
            プロトタイプ
          </h1>
        </header>

        <div
          className="Root_App__2 Frame"
        >
          <div
            className="Frame__1 Generated"
          >
            <div
              ref={ this.generated_ref }
              className="Generated"
            >
              <canvas
                ref={ this.canvas_ref }
                className="Canvas"
                width={ this.state.full_width_for_canvas }
                height={ this.state.full_height_for_canvas }
              />
            </div>
            {/*
            <img
              src={ require("./namecard.png") }
            />
            */}
          </div>
          <div
            className="Frame__2"
          >
            <div
              className="Editor"
            >
              <div
                className="Editor__row"
              >
                <div
                  className="Editor__label"
                >
                  会社名
                </div>
                <div
                  className="Editor__input_label_wrapper"
                >
                  <input
                    onChange={ this.handle_on_change_input_form.bind(this, "company") }
                    value={ this.state.company }
                    type="text"
                    ref={ this.first_focus_form }
                    placeholder="takumi.io"
                    className="Editor__input_label"
                  />
                </div>
                <div
                  className="Editor__input_position_elems"
                >
                  <span
                    className="Editor__input_position_label"
                  >
                    X
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "company_x")}
                    type="number"
                    value={ this.state.company_x }
                    className="Editor__input_position"
                  />
                  <span
                    className="Editor__input_position_label"
                  >
                    Y
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "company_y")}
                    type="number"
                    value={ this.state.company_y }
                    className="Editor__input_position"
                  />
                </div>
              </div>
              <div
                className="Editor__row"
              >
                <div
                  className="Editor__label"
                >
                  お名前
                </div>
                <div
                  className="Editor__input_label_wrapper"
                >
                  <input
                    onChange={ this.handle_on_change_input_form.bind(this, "name") }
                    value={ this.state.name }
                    type="text"
                    placeholder="西村 拓美"
                    className="Editor__input_label"
                  />
                </div>
                <div
                  className="Editor__input_position_elems"
                >
                  <span
                    className="Editor__input_position_label"
                  >
                    X
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "name_x")}
                    type="number"
                    value={ this.state.name_x }
                    className="Editor__input_position"
                  />
                  <span
                    className="Editor__input_position_label"
                  >
                    Y
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "name_y")}
                    type="number"
                    value={ this.state.name_y }
                    className="Editor__input_position"
                  />
                </div>
              </div>
              <div
                className="Editor__row"
              >
                <div
                  className="Editor__label"
                >
                  電話番号
                </div>
                <div
                  className="Editor__input_label_wrapper"
                >
                  <input
                    onChange={ this.handle_on_change_input_form.bind(this, "tel") }
                    value={ this.state.tel }
                    type="text"
                    placeholder="070-4461-0414"
                    className="Editor__input_label"
                  />
                </div>
                <div
                  className="Editor__input_position_elems"
                >
                  <span
                    className="Editor__input_position_label"
                  >
                    X
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "tel_x")}
                    type="number"
                    value={ this.state.tel_x }
                    className="Editor__input_position"
                  />
                  <span
                    className="Editor__input_position_label"
                  >
                    Y
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "tel_y")}
                    type="number"
                    value={ this.state.tel_y }
                    className="Editor__input_position"
                  />
                </div>
              </div>
              <div
                className="Editor__row"
              >
                <div
                  className="Editor__label"
                >
                  メールアドレス
                </div>
                <div
                  className="Editor__input_label_wrapper"
                >
                  <input
                    onChange={ this.handle_on_change_input_form.bind(this, "email") }
                    value={ this.state.email }
                    type="text"
                    placeholder="takumi@nishimura.io"
                    className="Editor__input_label"
                  />
                </div>
                <div
                  className="Editor__input_position_elems"
                >
                  <span
                    className="Editor__input_position_label"
                  >
                    X
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "email_x")}
                    type="number"
                    value={ this.state.email_x }
                    className="Editor__input_position"
                  />
                  <span
                    className="Editor__input_position_label"
                  >
                    Y
                  </span>
                  <input
                    onChange={ this.handle_on_change_input_form_with_only_number_constraint.bind(this, "email_y")}
                    type="number"
                    value={ this.state.email_y }
                    className="Editor__input_position"
                  />
                </div>
              </div>
              <div
                className="Editor__row"
              >
                <div
                  className="Editor__label"
                >
                  紙の種類
                </div>
                <ul
                  className="Editor__image_list"
                >
                  <li
                    className="Editor__image_list_item"
                  >
                    <img
                      onClick={ this.l_handle_on_click_namecard_bg.bind(this, 1) }
                      ref={ this.namecard_image_ref_1 }
                      src={ require("./namecard.png") }
                      className="Editor__paper_type"
                    />
                  </li>
                  <li
                    className="Editor__image_list_item"
                  >
                    <img
                      onClick={ this.l_handle_on_click_namecard_bg.bind(this, 2) }
                      ref={ this.namecard_image_ref_2 }
                      src={ require("./namecard_white.png") }
                      className="Editor__paper_type"
                    />
                  </li>
                  <li
                    className="Editor__image_list_item"
                  >
                    <img
                      onClick={ this.l_handle_on_click_namecard_bg.bind(this, 3) }
                      ref={ this.namecard_image_ref_3 }
                      src={ require("./namecard_black.png") }
                      className="Editor__paper_type"
                    />
                  </li>
                </ul>
              </div>
              <div
                className="Editor__row Editor__grow_space"
              >
              </div>
              <div
                className="Editor__row"
              >
                <div
                  onClick={ this.l_request_to_create_namecard.bind(this) }
                  className={`
                  Editor__request_to_create_namecard
                  ${
                    ( this.state.company &&
                      this.state.name &&
                      this.state.tel &&
                      this.state.email ) ? "-is_active" : ""
                  }
                  `}
                >
                  この名刺を制作する
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}




ReactDOM.render(
  <App />,
  document.getElementById("couldntbebetter")
);
