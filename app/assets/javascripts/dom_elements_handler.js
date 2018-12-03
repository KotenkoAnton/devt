"use strict";

class DomElementsHandler {
  constructor(whats_up) {
    this.whats_up = whats_up;
  }
  open_item_box(item) {
    let info_box_html = `
      <div id='info_box' class='container'>
        <div class='item-name'>Bolshoy_Dipol_RM5</div>
        <hr class='info-box-delimiter'>
        <div class='info-label'>Hostname:</div>
        <div class='info-text'>192.168.109.254</div><br>
        <div class='info-label'>Address:</div>
        <div class='info-text'>192.168.109.254</div><br>
        <div class='info-label'>Up since:</div>
        <div class='info-text'>08/28/18 20:25:29</div><br>
        <div class='info-label'>Responded:</div>
        <div class='info-text'>98.13%</div><br>
        <div class='info-label'>Status:</div>
        <div class='info-text green-status'>Active and responding</div><br>
        <hr class='info-box-delimiter'>
        <div class='info-label'>20180828 202618 UP</div>
        <div class='info-label'>20180828 202618 DOWN</div>
        <div class='info-label'>20180828 202618 UP</div>
        <div class='info-label'>20180828 202618 DOWN</div>
        <div class='info-label'>20180828 202618 UP</div>
        <div class='open-button'>
          <div class='open-button-text'>Перейти</div>
        </div>
        <div class='unlink-button'>
          <img src='assets/unlink_button.svg'>
        </div>
        <div class='copy-button'>
          <img src='assets/copy_button.svg'>
        </div>
        <div class='delete-button'>
          <img src='assets/delete_button.svg'>
        </div>
      </div>
    `;
    $("#canvas").after(info_box_html);
    $("#info_box").css({
      top: item.position.y - 65,
      left: item.position.x + 45
    });
  }

  close_item_box() {
    $("#info_box").remove();
  }

  _ruler_connection_types() {
    let connection_types = [
      "10BaseT",
      "10/100BaseTX",
      "10/100/100BaseTX",
      "Gigabit-Combo",
      "SFP",
      "GBIC",
      "SFP+",
      "XFP"
    ];
    let html = `
      <div class="connection-type">
        <lable>Радиоподключение</lable>
        <input type="radio" name="connection_type" checked>
      </div>
    `;
    for (let connection_type of connection_types) {
      html += `
      <div class="connection-type">
        <lable>${connection_type}</lable>
        <input type="radio" name="connection_type">
      </div>
      `;
    }
    return html;
  }

  _ruler_content(items) {
    return `
      <div class="block-wrapper">
        <div class="row">
          <div class="ruler-navigation">
            <div class="ruler-title">
              Тип связи
            </div>
            ${this._ruler_connection_types()}
          </div>
          <div class="ruler-main">
            <div class="items-row">
              <div class="first-item">
                <span class="item-img">
                  ${get_icon(items.first_item._icon_type)}
                </span>
                <label class="item-label"
                       style="left: ${130 -
                         (items.first_item.text_content.length - 6) * 4}px;">
                  ${items.first_item.text_content}
                </label>
              </div>
              <div class="second-item">
                <span class="item-img">
                  ${get_icon(items.second_item._icon_type)}
                </span>
                <label class="item-label"
                       style="left: ${130 -
                         (items.second_item.text_content.length - 6) * 4}px;">
                  ${items.second_item.text_content}
                </label>
              </div>
              <div class="line"></div>
            </div>

            <div id="save_connection_button" class="save-button">
              <div class='save-text'>Сохранить</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _action_box_content(content_type, items) {
    switch (content_type) {
      case "link": {
        return this._ruler_content(items);
      }
    }
  }

  _action_box_events(content_type, items = null) {
    switch (content_type) {
      case "link": {
        $("#save_connection_button").click(() => {
          this.whats_up.api_communicator.create_connection(
            this.whats_up.map_name,
            items.first_item._id,
            items.second_item._id,
            () => {
              document.location.reload();
            }
          );
        });
      }
    }
  }

  // action box
  open_action_box(title, content_type, items = null) {
    $("#action_box").remove();
    let action_box_html = `
      <div id='action_box' class='action-box'>
        <div class='title'>
          ${title}
        </div>
        <div id='close_button' class='close-button'>
          <img src='assets/close_button.svg'>
        </div>
        <br><br>
        ${this._action_box_content(content_type, items)}
      </div>
    `;

    $("#canvas").after(action_box_html);
    $("#close_button").click(() => {
      $("#action_box").remove();
    });

    this._action_box_events(content_type, items);
  }

  //
}
