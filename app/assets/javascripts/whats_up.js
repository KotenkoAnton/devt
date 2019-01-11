"use strict";

class WhatsUp {
  constructor(canvas_id) {
    this.api_communicator = new ApiCommunicator();
    this.drawer = new Drawer(); // pass "this" to store items in whats_up
    this.mouse_event_handler = new MouseEventHandler(this, new paper.Tool());
    // this.mouse_event_handler.switch_to("draggable");
    this.dom_elements_handler = new DomElementsHandler(this);
    this.map_name = undefined;
    this.canvas_id = canvas_id;
  }

  load_map(map_name) {
    this.map_name = map_name;
    this.api_communicator.fetch_map(map_name, data => {
      // set size of the map
      $(this.canvas_id).css({
        width: data["map_width"],
        height: data["map_height"]
      });
      $(this.canvas_id)
        .promise()
        .done(() => {
          paper.setup(this.canvas_id); // initialize paper after map size setting
          this.drawer.place_items(data["items"]);
          this.drawer.draw_shapes(data["shapes"]);
          this.drawer.draw_connections(data["connections"]);
          this.drawer.place_texts();
        });
    });
  }

  find_item_by_id(item_id) {
    return this.items.find(item => {
      return item._id == item_id;
    });
  }
}
