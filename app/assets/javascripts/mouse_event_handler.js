"use strict";

class MouseEventHandler {
  constructor(whats_up, papertool) {
    this.whats_up = whats_up;
    this.mode = "clickable";
    this.papertool = papertool;

    // draggable:

    this.moving = false;
    this.moving_target = null;

    //

    // clickable:

    this.mount_down_point = null;
    this.box_opened = false;

    //

    this._set_events();
  }

  switch_to(mode) {
    this.mode = mode;
  }

  _set_events() {
    // draggable:

    let draggable_mouse_down = event => {
      let item = target_item(event.point);
      if (!item) {
        return;
      }
      this.moving = true;
      this.moving_target = item;
      this.whats_up.drawer.delete_item_connections(item._id);
    };

    let draggable_mouse_move = event => {
      if (!this.moving) {
        return;
      }
      let x_shift = this.moving_target.position.x - event.point.x;
      let y_shift = this.moving_target.position.y - event.point.y;
      this.moving_target.position = event.point;
      if (!this.moving_target.text) {
        return;
      }
      this.moving_target.text.position.x =
        this.moving_target.text.position.x - x_shift;
      this.moving_target.text.position.y =
        this.moving_target.text.position.y - y_shift;
    };

    let draggable_mouse_up = event => {
      if (!this.moving_target) {
        return;
      }
      this.whats_up.drawer.draw_item_connections(this.moving_target._id);
      if (this.moving_target._type == "device") {
        this.whats_up.api_communicator.change_item_position(
          this.moving_target._id,
          event.point
        );
      }
      if (this.moving_target._type == "shape") {
        this.whats_up.api_communicator.change_shape_position(
          this.moving_target._id,
          {
            x: Math.floor(this.moving_target.bounds.x),
            y: Math.floor(this.moving_target.bounds.y)
          }
        );
      }
      this.moving = false;
      this.moving_target = null;
    };

    //

    // clickable:

    let clickable_mouse_down = event => {
      this.mouse_down_point = event.point;
    };

    let clickable_mouse_up = event => {
      if (
        this.mouse_down_point.x == event.point.x &&
        this.mouse_down_point.y == event.point.y
      ) {
        on_mouse_click(event);
      }
    };

    let on_mouse_click = event => {
      if (this.box_opened) {
        this.box_opened = false;
        this.whats_up.dom_elements_handler.close_box();
        return;
      } else {
        let item = target_item(event.point);
        if (!item) {
          return;
        }
        this.whats_up.dom_elements_handler.open_box(item);
        this.box_opened = true;
      }
    };

    //

    // main logic:

    let target_item = event_point => {
      for (let item of this.whats_up.drawer.get_items()) {
        if (is_target(item, event_point)) {
          item._type = "device";
          return item;
        }
      }

      for (let shape of this.whats_up.drawer.get_shapes()) {
        if (is_target(shape, event_point)) {
          shape._type = "shape";
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
      if (this.mode != "draggable") {
        return;
      }
      draggable_mouse_move(event);
    };

    this.papertool.onMouseUp = event => {
      choose_mode(clickable_mouse_up, draggable_mouse_up, event);
    };

    //
  }
}
