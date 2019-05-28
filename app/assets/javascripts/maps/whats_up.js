"use strict";

class WhatsUp {
  constructor(canvas_id) {
    this.api_communicator = new ApiCommunicator();
    this.drawer = new Drawer(); // pass "this" to store items in whats_up
    this.mouse_event_handler = new MouseEventHandler(this, new paper.Tool());
    // this.mouse_event_handler.switch_to("draggable");
    this.dom_elements_handler = new DomElementsHandler(this);
    this.control_buttons_state_handler = new ControlButtonsStateHandler(this);
    this.map_name = undefined;
    this.canvas_id = canvas_id;
    this.scale = 1;
  }

  load_map(map_name, focus_item_id = null, open = false) {
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
          this.drawer.draw_shapes(data["shapes"]);
          this.drawer.place_items(data["items"]);
          this.drawer.draw_connections(data["connections"]);
          this.drawer.place_inscriptions(data["inscriptions"]);
          this.drawer.place_texts(focus_item_id, open);
          if (focus_item_id) {
            let item = data["items"].find(item => {
              return item.id == focus_item_id;
            });
            if (item) {
              focus_on_item({ x: item.position_x, y: item.position_y });
              if (open) {
                item.position = { x: item.position_x, y: item.position_y };
                this.api_communicator.fetch_item_info(item.id, data => {
                  data.id = item.id;
                  this.mouse_event_handler.box_opened = true;
                  this.dom_elements_handler.open_item_box(item, data, {
                    layerX: item.position_x,
                    layerY: item.position_y
                  });
                  this.dom_elements_handler.open_whole_info_box(data);
                });
              }
            }
          }
        });
    });

    let focus_on_item = position => {
      $("#canvas_wrapper").scrollLeft(
        position.x - $("#canvas_wrapper").width() / 2
      );
      $("#canvas_wrapper").scrollTop(
        position.y - $("#canvas_wrapper").height() / 2
      );
    };
  }

  find_item_by_id(item_id) {
    return this.items.find(item => {
      return item._id == item_id;
    });
  }

  copy_to_clipboard(text) {
    const text_input = $("<textarea></textarea>");
    text_input.val(text);
    $("#map_name").append(text_input);
    text_input.focus();
    text_input.select();
    document.execCommand("copy");
    text_input.remove();
  }

  perform_scale(scale_change) {
    if (
      (this.scale > 0.9 && scale_change > 0) ||
      (this.scale < 0.1 && scale_change < 0)
    ) {
      return;
    }
    this.scale += scale_change;
    $("#scale_percentage_label").html(`${Math.floor(this.scale * 100)}%`);
    paper.project.view.scale(1 + scale_change, { x: 0, y: 0 });
  }
}
