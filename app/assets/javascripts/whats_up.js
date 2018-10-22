"use strict";

class WhatsUp {
  constructor(canvas_id) {
    this.api_communicator = new ApiCommunicator();
    this.drawer = new Drawer(); // pass "this" to store items in whats_up
    this.mouse_event_handler = new MouseEventHandler(this, new paper.Tool());
    this.dom_elements_handler = new DomElementsHandler();
    paper.setup(canvas_id); // initialize paper
  }

  load_map(map_name) {
    this.api_communicator.fetch_map(map_name, data => {
      this.drawer.place_items(data["items"]);
      this.drawer.draw_shapes(data["shapes"]);
      this.drawer.draw_connections(data["connections"]);
    });
  }

  find_item_by_id(item_id) {
    return this.items.find(item => {
      return item._id == item_id;
    });
  }
}
