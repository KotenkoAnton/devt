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
                  ${get_icon(
                    items.first_item._icon_type
                      ? items.first_item._icon_type
                      : "Shape"
                  )}
                </span>
                <label class="item-label">
                  ${
                    items.first_item.text_content
                      ? items.first_item.text_content
                      : "Фигура"
                  }
                </label>
              </div>
              <div class="second-item">
                <span class="item-img">
                  ${get_icon(
                    items.second_item._icon_type
                      ? items.second_item._icon_type
                      : "Shape"
                  )}
                </span>
                <label class="item-label">
                  ${
                    items.second_item.text_content
                      ? items.second_item.text_content
                      : "Фигура"
                  }
                </label>
              </div>
              <div class="connection-line"></div>
            </div>

            <div id="save_connection_button" class="confirm-button">
              <div class='text'>Сохранить</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _ruler_unlink_content(items) {
    return `
      <div class="items-row">
        <div class="first-item">
          <span class="item-img">
            ${get_icon(
              items.first_item._icon_type
                ? items.first_item._icon_type
                : "Shape"
            )}
          </span>
          <label class="item-label">
            ${
              items.first_item.text_content
                ? items.first_item.text_content
                : "Фигура"
            }
          </label>
        </div>
        <div class="second-item">
          <span class="item-img">
            ${get_icon(
              items.second_item._icon_type
                ? items.second_item._icon_type
                : "Shape"
            )}
          </span>
          <label class="item-label">
            ${
              items.second_item.text_content
                ? items.second_item.text_content
                : "Фигура"
            }
          </label>
        </div>
        <div class="connection-line unlink-line"></div>
      </div>
      <div id="unlink_connection_button" class="confirm-button unlink-confirm-button">
        <div class='text'>Удалить связь</div>
      </div>
    `;
  }

  _add_object_content() {
    return `
      <div class="adding-wrapper">
        <div class="add-item">
          <img src="assets/radio.svg" class="object-type-img uncentered-img">
          <span class="uncentered-text">Радио<span>
        </div>
        <div class="add-item">
          <img src="assets/hub.svg" class="object-type-img">
          <span>Свичи</span>
        </div>
        <div class="add-item">
          <img src="assets/L3.svg" class="object-type-img">
          <span>L3-устройства</span>
        </div>
        <div class="add-item">
          <img src="assets/router.svg" class="object-type-img">
          <span>Роутеры</span>
        </div>
        <div class="add-item with-no-right-margin">
          <img src="assets/cctv.svg" class="object-type-img">
          <span>Камеры</span>
        </div>
        <div class="add-item">
          <img src="assets/radio.svg" class="object-type-img uncentered-img">
          <span>Оповещалки</span>
        </div>
        <div class="add-item">
          <img src="assets/desktop.svg" class="object-type-img">
          <span>Компьютеры</span>
        </div>
        <div class="add-item">
          <img src="assets/network.svg" class="object-type-img">
          <span>Конвертеры</span>
        </div>
        <div class="add-item">
          <img src="assets/molecular.svg" class="object-type-img">
          <span>Соединения</span>
        </div>
        <div class="add-item with-no-right-margin">
          <img src="assets/frame.svg" class="object-type-img">
          <span>Рамки</span>
        </div>
        <div class="add-item">
          <img src="assets/figures.svg" class="object-type-img">
          <span>Фигуры</span>
        </div>
        <div class="add-item">
          <img src="assets/radio.svg" class="object-type-img uncentered-img">
          <span>Надписи</span>
        </div>
        <div class="add-item">
          <img src="assets/radio.svg" class="object-type-img uncentered-img">
          <span>Офис</span>
        </div>
        <div class="add-item with-no-right-margin">
          <img src="assets/cloud.svg" class="object-type-img">
          <span>Зоны</span>
        </div>
      </div>
    `;
  }

  _add_objects_items_content(type) {
    let items = [];
    let breadcrumb;
    switch (type) {
      case "add_object radio": {
        breadcrumb = "Радио";
        items = [
          { label: "Infinet R200", img_name: "rectangle" },
          { label: "Infinet R500", img_name: "rectangle" },
          { label: "Infinet R2000", img_name: "rectangle" },
          { label: "Infinet R3000", img_name: "rectangle" },
          { label: "Infinet R5000-H02", img_name: "rectangle" },
          { label: "Infinet R5000-H05-5.3", img_name: "rectangle" },
          { label: "Infinet R5000-H05-2.4", img_name: "rectangle" },
          { label: "Infinet R5000-H05-6.3", img_name: "rectangle" },
          { label: "Infinet R5000-Ho7-2.4", img_name: "rectangle" },
          { label: "Infinet R5000-H07-6.3", img_name: "rectangle" },
          { label: "Infinet R5000-H07-5.3", img_name: "rectangle" },
          { label: "Infinet R5000-H08", img_name: "rectangle" },
          { label: "Infinet R5000-H11", img_name: "rectangle" },
          { label: "Infilink XG-5", img_name: "rectangle" },
          { label: "Infilink XG-6", img_name: "rectangle" }
        ];
        break;
      }
      case "add_object office": {
        breadcrumb = "Офис";
        items = [
          { label: "Принтер", img_name: "printer" },
          { label: "Сканер", img_name: "scanner" },
          { label: "Факс", img_name: "fax" }
        ];
        break;
      }
      case "add_object routers": {
        breadcrumb = "Роутеры";
        items = [
          { label: "SNR-CPE-W4N", img_name: "modem" },
          { label: "Другой роутер", img_name: "router" }
        ];
        break;
      }
    }

    let html = "";
    for (let item of items) {
      html += `
        <div class="item">
          <img src="assets/${item.img_name}.svg">
          <span>${item.label}<span>
        </div>
      `;
    }
    return `
      <div class="breadcrumbs">
        <span id="all_objects_button" class="all-objects">Все объекты</span><span class="current-objects"> / ${breadcrumb}</span>
      </div>
      <div class="adding-wrapper">
        ${html}
      </div>
    `;
  }

  _action_box_content(content_type, items) {
    switch (content_type) {
      case "link": {
        return this._ruler_content(items);
      }
      case "unlink": {
        return this._ruler_unlink_content(items);
      }
      case "add_object": {
        return this._add_object_content();
      }
      case "add_object routers":
      case "add_object radio":
      case "add_object office": {
        return this._add_objects_items_content(content_type);
      }
    }
  }

  _action_box_title(content_type) {
    switch (content_type) {
      case "link": {
        return "Создание связности объектов";
      }
      case "unlink": {
        return "Удаление связности объектов";
      }
      case "add_object": {
        return "Добавление объектов";
      }
    }
  }

  _reset_action_box(content_type) {
    this._clear_action_box();
    this._fill_action_box(this._action_box_content(content_type));
    this._set_action_box_events(content_type);
  }

  _handle_object_type_selection(text) {
    let prefix = "add_object";
    switch (text) {
      case "Радио": {
        this._reset_action_box(prefix + " radio");
        break;
      }
      case "Офис": {
        this._reset_action_box(prefix + " office");
        break;
      }
      case "Роутеры": {
        this._reset_action_box(prefix + " routers");
        break;
      }
    }
    $("#all_objects_button").click(() => {
      this._clear_action_box();
      this._fill_action_box(this._action_box_content("add_object"));
      this._set_action_box_events("add_object");
    });
  }

  _clear_action_box() {
    $("#main_wrapper").empty();
  }

  _fill_action_box(content) {
    $("#main_wrapper").html(content);
  }

  _set_action_box_events(content_type, items = null) {
    switch (content_type) {
      case "link": {
        $("#save_connection_button").click(() => {
          this.whats_up.api_communicator.create_connection(
            this.whats_up.map_name,
            items.first_item,
            items.second_item,
            () => {
              document.location.reload();
            }
          );
        });
        break;
      }
      case "unlink": {
        $("#unlink_connection_button").click(() => {
          this.whats_up.api_communicator.delete_connection(
            this.whats_up.map_name,
            items.first_item,
            items.second_item,
            () => {
              document.location.reload();
            }
          );
        });
        break;
      }
      case "add_object": {
        $(".add-item").click(event => {
          let text = event.currentTarget.children[1].firstChild.textContent;
          this._handle_object_type_selection(text);
        });
        break;
      }
      case "add_object radio": {
        $(".item").click(event => {
          let text = event.currentTarget.children[1].firstChild.textContent;
          console.log(text);
        });
        break;
      }
      case "add_object office": {
        $(".item").click(event => {
          let text = event.currentTarget.children[1].firstChild.textContent;
          console.log(text);
        });
        break;
      }
      case "add_object routers": {
        $(".item").click(event => {
          let text = event.currentTarget.children[1].firstChild.textContent;
          console.log(text);
        });
        break;
      }
    }
  }

  // action box
  open_action_box(content_type, items = null) {
    $("#action_box").remove();
    if (content_type == "link" || content_type == "unlink") {
      $("#ruler_img").prop("src", "/assets/ruler.svg");
    }
    let action_box_html = `
      <div id='action_box' class='action-box'>
        <div class='title'>
          ${this._action_box_title(content_type)}
        </div>
        <div id='close_button' class='close-button'>
          <img src='assets/close_button.svg'>
        </div>
        <br><br>
        <div id="main_wrapper">
          ${this._action_box_content(content_type, items)}
        </div>
      </div>
    `;

    $("#canvas").after(action_box_html);
    $("#close_button").click(() => {
      $("#action_box").remove();
    });
    this._set_action_box_events(content_type, items);
  }

  //
}
