"use strict";

let init = () => {
  let whats_up = new WhatsUp("canvas");
  whats_up.load_map("Bolshoy");
};

window.onload = () => init();
