"use strict";
class ControlButtonsStateHandler {
  constructor(whats_up) {
    this._set_events();
    this.before_enter_icons = {};
    this.buttons_activity = {
      ruler_button: false,
      add_button: false,
      delete_button: false
    };
    this.state = "main";
    this.whats_up = whats_up;
  }

  _select_button(button) {
    const buttons = ["ruler_button", "add_button", "delete_button"];
    $(".control-button").hide();
    $(`#${button}_active_img`).show();
    buttons.forEach(btn => {
      if (btn == button) {
        return;
      }
      this._inactivate_button(btn);
      $(`#${btn}_inactive_img`).show();
    });
  }

  set_all_buttons_to_neutral() {
    const buttons = ["ruler_button", "add_button", "delete_button"];
    $(".control-button").hide();
    buttons.forEach(btn => {
      this._inactivate_button(btn);
      this._set_before_enter_icon(btn, `${btn}_neutral_img`);
      $(`#${btn}_neutral_img`).show();
    });
  }

  _button_mouse_enter(button, e) {
    const buttons_class = {
      ruler_button: "ruler-control-button",
      delete_button: "delete-control-button",
      add_button: "add-control-button"
    };
    if (this._get_button_activity(button)) {
      return;
    }
    if (e.target.id == button) {
      let visible_child;
      for (let child of e.target.children) {
        if ($(child).is(":visible")) {
          visible_child = child;
          break;
        }
      }
      this._set_before_enter_icon(button, visible_child.id);
    } else {
      this._set_before_enter_icon(button, e.target.id);
    }
    $(`.${buttons_class[button]}`).hide();
    $(`#${button}_hover_img`).show();
  }

  _button_mouse_leave(button) {
    if (
      this._get_button_activity(button) ||
      !this._get_before_enter_icon(button)
    ) {
      return;
    }
    const buttons_class = {
      ruler_button: "ruler-control-button",
      delete_button: "delete-control-button",
      add_button: "add-control-button"
    };
    $(`.${buttons_class[button]}`).hide();
    $(`#${this._get_before_enter_icon(button)}`).show();
  }

  _set_before_enter_icon(button, icon) {
    this.before_enter_icons[button] = icon;
  }

  _get_before_enter_icon(button) {
    return this.before_enter_icons[button];
  }

  _inactivate_button(button) {
    this.buttons_activity[button] = false;
  }

  _activate_button(button) {
    this.buttons_activity[button] = true;
  }

  _get_button_activity(button) {
    return this.buttons_activity[button];
  }

  _set_events() {
    $(document).keyup(e => {
      if (e.key === "Escape" && this.state == "editing") {
        this.whats_up.mouse_event_handler.switch_to("draggable");
        this.whats_up.mouse_event_handler.switch_clickable_mode_to(
          "main_usage"
        );
        this.set_all_buttons_to_neutral();
      }
    });

    $("#ruler_button").mouseenter(e => {
      this._button_mouse_enter("ruler_button", e);
    });

    $("#ruler_button").mouseleave(() => {
      this._button_mouse_leave("ruler_button");
    });

    $("#delete_button").mouseenter(e => {
      this._button_mouse_enter("delete_button", e);
    });

    $("#delete_button").mouseleave(() => {
      this._button_mouse_leave("delete_button");
    });

    $("#add_button").mouseenter(e => {
      this._button_mouse_enter("add_button", e);
    });

    $("#add_button").mouseleave(() => {
      this._button_mouse_leave("add_button");
    });

    $("#complete_editing").mouseenter(() => {
      $("#complete_editint_neutral_img").hide();
      $("#complete_editint_hover_img").show();
    });

    $("#complete_editing").mouseleave(() => {
      $("#complete_editint_neutral_img").show();
      $("#complete_editint_hover_img").hide();
    });

    $("#edit_map_button").click(() => {
      this.state = "editing";
      this.whats_up.mouse_event_handler.switch_to("draggable");
      this.whats_up.mouse_event_handler.switch_clickable_mode_to("main_usage");
      $("#info_box").remove();
      $("#right-sidebar").removeClass("sidebar-open");
      $("#edit_map_button").hide();
      $(".control-edit-button").css("display", "inline-block");
    });

    $("#complete_editing").click(() => {
      this.state = "main";
      this.whats_up.mouse_event_handler.switch_to("clickable");
      this.whats_up.mouse_event_handler.switch_clickable_mode_to("main_usage");
      this.set_all_buttons_to_neutral();
      $("#edit_map_button").show();
      $(".control-edit-button").hide();
    });

    $("#add_button").click(() => {
      this.set_all_buttons_to_neutral();
      this.whats_up.mouse_event_handler.switch_to("clickable");
      this.whats_up.mouse_event_handler.switch_clickable_mode_to("main_usage");
      this.whats_up.dom_elements_handler.open_action_box("add_object");
    });

    $("#ruler_button").click(() => {
      if (this.whats_up.mouse_event_handler.get_clickable_mode() == "ruler") {
        this.set_all_buttons_to_neutral();
        this.whats_up.mouse_event_handler.switch_to("draggable");
        this.whats_up.mouse_event_handler.switch_clickable_mode_to(
          "main_usage"
        );
        $(".ruler-control-button").hide();
        $("#ruler_button_hover_img").show();
        $("body").css({ cursor: "default" });
      } else {
        this._select_button("ruler_button");
        this.whats_up.mouse_event_handler.switch_to("clickable");
        this.whats_up.mouse_event_handler.switch_clickable_mode_to("ruler");
        this._activate_button("ruler_button");
        $("body").css({ cursor: "crosshair" });
      }
    });

    $("#confirm_box_close_button").click(() => {
      $("#confirm_deleting_box").css("display", "none");
      this.set_all_buttons_to_neutral();
      this.whats_up.mouse_event_handler.switch_to("draggable");
      this.whats_up.mouse_event_handler.switch_clickable_mode_to("main_usage");
    });

    $("#delete_button").click(() => {
      if (
        this.whats_up.mouse_event_handler.get_clickable_mode() == "deleting"
      ) {
        this.set_all_buttons_to_neutral();
        $(".delete-control-button").hide();
        $("#delete_button_hover_img").show();
        this.whats_up.mouse_event_handler.switch_to("draggable");
        this.whats_up.mouse_event_handler.switch_clickable_mode_to(
          "main_usage"
        );

        $("body").css({ cursor: "auto" });
      } else {
        this._select_button("delete_button");
        this._activate_button("delete_button");
        this.whats_up.mouse_event_handler.switch_to("clickable");
        this.whats_up.mouse_event_handler.switch_clickable_mode_to("deleting");

        $("body").css({ cursor: "crosshair" });
      }
    });
  }
}
