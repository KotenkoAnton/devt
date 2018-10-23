"use strict";

let init = () => {
  let whats_up = new WhatsUp("canvas");
  let map_name = $("#map_name").html();
  whats_up.load_map(map_name);
};

window.onload = () => init();
