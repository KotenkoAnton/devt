"use strict";
let whats_up;

let set_events = () => {
  $("#add_button").click(() => {
    whats_up.dom_elements_handler.open_action_box("add_object");
  });

  $("#ruler_button").click(() => {
    if (whats_up.mouse_event_handler.get_clickable_mode() == "ruler") {
      whats_up.mouse_event_handler.switch_clickable_mode_to("main_usage");
      $("#ruler_img").prop("src", "/assets/ruler.svg");
    } else {
      whats_up.mouse_event_handler.switch_to("clickable");
      whats_up.mouse_event_handler.switch_clickable_mode_to("ruler");
      $("#ruler_img").prop("src", "/assets/active_ruler.svg");
    }
  });

  // move items on map

  $("#move_button").click(() => {
    whats_up.api_communicator.move_items_on_map(
      $("#map_name").html(),
      $("#down_move_input").val(),
      $("#right_move_input").val(),
      () => {
        document.location.reload();
      }
    );
  });

  //

  // switch mode

  $("#switch_move_button").click(() => {
    whats_up.mouse_event_handler.toggle_mode();
  });

  //
};

let init = () => {
  whats_up = new WhatsUp("canvas");
  let map_name = $("#map_name").html();
  whats_up.load_map(map_name);

  set_events();
};

window.onload = () => init();
