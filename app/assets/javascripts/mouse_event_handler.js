"use strict";

class MouseEventHandler {
  constructor(whats_up, papertool) {
    this.whats_up = whats_up;
    this.mode = "clickable"; // clickable_ draggable
    this.clickable_mode = "main_usage"; // main_usage, ruler, adding_object, deleting
    this.papertool = papertool;

    // draggable:

    this.moving = false;
    this.moving_target = null;
    this.expanding = false;
    this.expanding_hover = false;
    this.edge = null;

    //

    // clickable:

    this.mount_down_point = null;
    this.box_opened = false;
    this.scrolling = false;
    this.scrolling_first_position = null;

    //

    // ruler:

    this.ruler_first_item = undefined;
    this.ruler_second_item = undefined;

    //

    // adding object:

    this.adding_object;

    //

    this._set_events();
  }

  switch_to(mode) {
    this.mode = mode;
  }

  toggle_mode() {
    this.mode = this.mode == "clickable" ? "draggable" : "clickable";
  }

  switch_clickable_mode_to(mode) {
    this.ruler_first_item = undefined;
    this.ruler_second_item = undefined;
    this.clickable_mode = mode;
    if (mode == "adding_object") {
      this._set_cursor("crosshair");
    } else {
      this._set_cursor("auto");
    }
  }

  get_clickable_mode() {
    return this.clickable_mode;
  }

  set_adding_object(adding_object) {
    this.adding_object = adding_object;
  }

  _set_events() {
    // draggable:

    let draggable_mouse_down = event => {
      if (this.expanding_hover) {
        this.expanding = true;
        this.whats_up.drawer.delete_item_connections(
          this.moving_target._id,
          "Shape"
        );
        return;
      }
      let item = target_item(event.point);
      if (!item) {
        return;
      }
      this.moving = true;
      this.moving_target = item;
      let type;
      if (item._type == "device" || item._type == "map") {
        type = "Item";
      }
      if (item._type == "shape") {
        type = "Shape";
      }
      this.whats_up.drawer.delete_item_connections(item._id, type);
      this._set_cursor("move");
    };

    let dragging = event_point => {
      let x_shift = this.moving_target.position.x - event_point.x;
      let y_shift = this.moving_target.position.y - event_point.y;
      this.moving_target.position = event_point;
      if (!this.moving_target.text) {
        return;
      }
      this.moving_target.text.position.x -= x_shift;
      this.moving_target.text.position.y -= y_shift;
      this.moving_target.rect.position.x -= x_shift;
      this.moving_target.rect.position.y -= y_shift;
    };

    let draggable_mouse_move = event => {
      // check for dragging
      if (this.moving) {
        dragging(event.point);
        return;
      }
      // check for expanding
      if (this.expanding) {
        expanding(event.point);
        return;
      }
      let cursor = check_for_expand(event);
      if (cursor) {
        this._set_cursor(cursor);
      }
    };

    let draggable_mouse_up = event => {
      if (this.expanding) {
        this.expanding_hover = false;
        this.expanding = false;
        this.edge = null;
        this.whats_up.api_communicator.change_shape_size(
          this.moving_target._id,
          {
            width: this.moving_target.bounds.width,
            height: this.moving_target.bounds.height
          },
          {
            x: Math.floor(this.moving_target.bounds.x),
            y: Math.floor(this.moving_target.bounds.y)
          }
        );
        this.whats_up.drawer.draw_item_connections(
          this.moving_target._id,
          "Shape"
        );
        this.moving_target = null;
        return;
      }

      if (!this.moving_target) {
        return;
      }
      switch (this.moving_target._type) {
        case "device":
        case "map": {
          this.whats_up.drawer.draw_item_connections(
            this.moving_target._id,
            "Item"
          );
          this.whats_up.api_communicator.change_item_position(
            this.moving_target._id,
            event.point,
            data => {
              if (data.corrected) {
                location.reload();
              }
            }
          );
          break;
        }
        case "shape": {
          this.whats_up.drawer.draw_item_connections(
            this.moving_target._id,
            "Shape"
          );
          this.whats_up.api_communicator.change_shape_position(
            this.moving_target._id,
            {
              x: Math.floor(this.moving_target.bounds.x),
              y: Math.floor(this.moving_target.bounds.y)
            }
          );
          break;
        }
        case "inscription": {
          this.whats_up.api_communicator.change_inscription_position(
            this.moving_target.ext_id,
            this.moving_target.point
          );
        }
      }
      this.moving = false;
      this.moving_target = null;
      this._set_cursor("default");
    };

    // expanding
    let expanding = event_point => {
      if (!this.edge) {
        return;
      }
      let point;
      let size;
      if (this.edge == "bottom") {
        point = new paper.Point(
          this.moving_target.bounds.x,
          this.moving_target.bounds.y
        );
        let last_y =
          this.moving_target.bounds.y + this.moving_target.bounds.height;
        let y_difference = event_point.y - last_y;
        size = new paper.Size(
          this.moving_target.bounds.width,
          this.moving_target.bounds.height + y_difference
        );
      }
      if (this.edge == "up") {
        let last_y = this.moving_target.bounds.y;
        let y_difference = event_point.y - last_y;
        size = new paper.Size(
          this.moving_target.bounds.width,
          this.moving_target.bounds.height - y_difference
        );
        point = new paper.Point(this.moving_target.bounds.x, event_point.y);
      }
      if (this.edge == "right") {
        point = new paper.Point(
          this.moving_target.bounds.x,
          this.moving_target.bounds.y
        );
        let last_x =
          this.moving_target.bounds.x + this.moving_target.bounds.width;
        let x_difference = event_point.x - last_x;
        size = new paper.Size(
          this.moving_target.bounds.width + x_difference,
          this.moving_target.bounds.height
        );
      }
      if (this.edge == "left") {
        let last_x = this.moving_target.bounds.x;
        let x_difference = event_point.x - last_x;
        size = new paper.Size(
          this.moving_target.bounds.width - x_difference,
          this.moving_target.bounds.height
        );

        point = new paper.Point(event_point.x, this.moving_target.bounds.y);
      }
      this.whats_up.drawer.delete_rectangle(this.moving_target._id);
      let rect = this.whats_up.drawer.draw_rectangle(point, size);
      rect._type = "shape";
      rect._id = this.moving_target._id;
      this.moving_target = rect;
      this.whats_up.drawer.add_rectangle(rect);
    };

    let get_edge = (event_point, bounds) => {
      let left_x = bounds.x;
      let right_x = bounds.x + bounds.width;
      let up_y = bounds.y;
      let bottom_y = bounds.y + bounds.height;
      if (Math.abs(event_point.y - bottom_y) < 10) {
        return "bottom";
      }
      if (Math.abs(event_point.y - up_y) < 10) {
        return "up";
      }
      if (Math.abs(event_point.x - right_x) < 10) {
        return "right";
      }
      if (Math.abs(event_point.x - left_x)) {
        return "left";
      }
      return null;
    };

    let check_for_expand = event => {
      this.edge = null;
      this.expanding_hover = false;
      let hitOptions = {
        stroke: true,
        tolerance: 5
      };
      let hit_result = paper.project.hitTest(event.point, hitOptions);
      if (!hit_result) {
        this._set_cursor("default");
        return;
      }
      let item = hit_result.item;
      if (item._type != "shape") {
        return;
      }
      this.edge = get_edge(event.point, item.bounds);
      this.expanding_hover = true;
      this.moving_target = item;
      switch (this.edge) {
        case "bottom": {
          return "ns-resize";
        }
        case "up": {
          return "ns-resize";
        }
        case "right": {
          return "ew-resize";
        }
        case "left": {
          return "ew-resize";
        }
      }
      return null;
    };

    //

    // clickable:

    let clickable_mouse_down = event => {
      if (
        !target_item(event.point) &&
        !this.box_opened &&
        this.clickable_mode == "main_usage"
      ) {
        this.scrolling = true;
        this._set_cursor("move");
        this.scrolling_first_position = {
          x: event.event.clientX,
          y: event.event.clientY
        };
      }
      this.mouse_down_point = event.point;
    };

    let clickable_mouse_up = event => {
      if (
        Math.abs(this.mouse_down_point.x - event.point.x) < 10 &&
        Math.abs(this.mouse_down_point.y - event.point.y) < 10
      ) {
        on_mouse_click(event);
      }
    };

    let clickable_main_usage = event => {
      if (this.box_opened) {
        this.box_opened = false;
        this.whats_up.dom_elements_handler.close_item_box();
        return;
      } else {
        let item = target_item(event.point);
        if (!item) {
          return;
        }
        switch (item._type) {
          case "device": {
            this.whats_up.api_communicator.fetch_item_info(item._id, data => {
              data.id = item._id;
              this.whats_up.dom_elements_handler.open_item_box(item, data);
              this.box_opened = true;
            });
            break;
          }
          case "map": {
            this.whats_up.api_communicator.map_name_by_item_id(
              item._id,
              data => {
                // redirecting to selected map
                window.location.href = `${window.location.origin}/maps?map=${
                  data["map_name"]
                }`;
              }
            );
          }
        }
      }
    };

    let clickable_ruler = event => {
      let item = target_item(event.point);
      if (!item) {
        return;
      }
      if (!this.ruler_first_item) {
        this.ruler_first_item = item;
      } else if (this.ruler_first_item != item) {
        this.ruler_second_item = item;
        this.whats_up.api_communicator.check_connection_existence(
          this.whats_up.map_name,
          this.ruler_first_item,
          this.ruler_second_item,
          data => {
            this.whats_up.dom_elements_handler.open_action_box(
              data["connection_id"] ? "unlink" : "link",
              {
                first_item: this.ruler_first_item,
                second_item: this.ruler_second_item
              }
            );
            this.ruler_first_item = undefined;
            this.ruler_second_item = undefined;
            this.clickable_mode = "main_usage";
          }
        );
      }
    };

    let delete_object = event => {
      let item = target_item(event.point);
      if (!item) {
        return;
      }
      switch (item._type) {
        case "map": {
          whats_up.api_communicator.delete_zone_item(item._id, () => {
            location.reload();
          });
          break;
        }
        case "shape": {
          whats_up.api_communicator.delete_shape(item._id, () => {
            location.reload();
          });
          break;
        }
        case "inscription": {
          whats_up.api_communicator.delete_inscription(item.ext_id, () => {
            location.reload();
          });
          break;
        }
      }
    };

    let on_mouse_click = event => {
      switch (this.clickable_mode) {
        case "main_usage": {
          clickable_main_usage(event);
          break;
        }
        case "ruler": {
          clickable_ruler(event);
          break;
        }
        case "adding_object": {
          add_object(event);
          break;
        }
        case "deleting": {
          delete_object(event);
          break;
        }
      }
    };

    //

    // adding object

    let add_object = event => {
      this.switch_clickable_mode_to("main_usage");
      this.adding_object.position_x = event.event.layerX;
      this.adding_object.position_y = event.event.layerY;

      this.adding_object.map_name = this.whats_up.map_name;
      switch (this.adding_object.placeable_type) {
        case "Device": {
          this.adding_object.position_x += 18;
          this.adding_object.position_y -= 10;
          this.whats_up.api_communicator.add_device_and_item(
            this.adding_object,
            data => {
              place_new_object(data);
              this.adding_object = null;
            }
          );
          break;
        }
        case "Map": {
          this.adding_object.position_x += 18;
          this.adding_object.position_y -= 10;
          this.whats_up.api_communicator.add_map_item(
            this.adding_object,
            data => {
              place_new_object(data);
              this.adding_object = null;
            }
          );
          break;
        }
        case "Shape": {
          this.adding_object.position_x += 1;
          this.adding_object.position_y -= 5;
          this.whats_up.api_communicator.add_shape(this.adding_object, data => {
            this.adding_object.id = data.shape_id;
            this.adding_object.height = data.height;
            this.adding_object.width = data.width;
            this.adding_object.shape = data.shape;
            this.whats_up.drawer.draw_shape(this.adding_object);
          });
          break;
        }
        case "Inscription": {
          this.whats_up.api_communicator.add_new_inscription(
            this.adding_object,
            data => {
              this.adding_object.id = data.id;
              this.whats_up.drawer.place_inscription(this.adding_object);
            }
          );
        }
      }

      let place_new_object = data => {
        this.adding_object.id = data.item_id;
        this.adding_object = this.whats_up.drawer.place_item(
          this.adding_object
        );
        this.whats_up.drawer.place_text(this.adding_object);
      };
    };

    // main logic:

    let target_item = event_point => {
      for (let item of this.whats_up.drawer.get_items()) {
        if (is_target(item, event_point)) {
          return item;
        }
      }

      for (let inscription of this.whats_up.drawer.get_inscriptions()) {
        if (
          event_point.x > inscription.point.x - 10 &&
          event_point.x <
            inscription.point.x + inscription.content.length * 8.7 &&
          event_point.y > inscription.point.y - 10 &&
          event_point.y < inscription.point.y + 10
        ) {
          return inscription;
        }
      }

      for (let shape of this.whats_up.drawer.get_shapes()) {
        if (is_target(shape, event_point)) {
          return shape;
        }
      }
    };

    let is_target = (item, event_point) => {
      return (
        event_point.x > item.bounds.x &&
        event_point.x < item.bounds.x + item.bounds.width &&
        event_point.y > item.bounds.y &&
        event_point.y < item.bounds.y + item.bounds.height
      );
    };

    let choose_mode = (clickable_function, draggable_function, event) => {
      switch (this.mode) {
        case "clickable": {
          clickable_function(event);
          break;
        }
        case "draggable": {
          draggable_function(event);
          break;
        }
      }
    };

    this.papertool.onMouseDown = event => {
      choose_mode(clickable_mouse_down, draggable_mouse_down, event);
    };

    this.papertool.onMouseMove = event => {
      if (this.scrolling) {
        let x_diff = this.scrolling_first_position.x - event.event.clientX;
        let y_diff = this.scrolling_first_position.y - event.event.clientY;
        this.scrolling_first_position = {
          x: event.event.clientX,
          y: event.event.clientY
        };
        $("#canvas_wrapper").scrollLeft(
          $("#canvas_wrapper").scrollLeft() + x_diff
        );
        $("#canvas_wrapper").scrollTop(
          $("#canvas_wrapper").scrollTop() + y_diff
        );
        return;
      }
      if (this.mode != "draggable") {
        return;
      }
      draggable_mouse_move(event);
    };

    this.papertool.onMouseUp = event => {
      if (this.scrolling) {
        this.scrolling_first_position = null;
        this.scrolling = false;
        this._set_cursor("default");
        return;
      }
      choose_mode(clickable_mouse_up, draggable_mouse_up, event);
    };

    //
  }

  _set_cursor(cursor) {
    $("body").css({ cursor });
  }
}
