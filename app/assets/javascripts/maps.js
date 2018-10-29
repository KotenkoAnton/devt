"use strict";
let whats_up;

let set_events = () => {
  $("#add_button").click(() => {
    whats_up.dom_elements_handler.open_action_box("Добавить объект");
  });
};

let init = () => {
  whats_up = new WhatsUp("canvas");
  let map_name = $("#map_name").html();
  whats_up.load_map(map_name);

  set_events();
};

window.onload = () => init();
