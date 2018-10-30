"use strict";

class MouseEventHandler {
  constructor(whats_up, papertool) {
    this.whats_up = whats_up;
    this.mode = "clickable";
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

    //

    this._set_events();
  }

  switch_to(mode) {
    this.mode = mode;
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
      if (item._type == "device") {
        type = "Item";
      }
      if (item._type == "shape") {
        type = "Shape";
      }
      this.whats_up.drawer.delete_item_connections(item._id, type);
      set_cursor("move");
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
        set_cursor(cursor);
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
      let type;
      if (this.moving_target._type == "device") {
        type = "Item";
      }
      if (this.moving_target._type == "shape") {
        type = "Shape";
      }
      this.whats_up.drawer.draw_item_connections(this.moving_target._id, type);
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
      set_cursor("default");
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
        set_cursor("default");
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
        this.whats_up.dom_elements_handler.close_item_box();
        return;
      } else {
        let item = target_item(event.point);
        if (!item) {
          return;
        }
        this.whats_up.dom_elements_handler.open_item_box(item);
        this.box_opened = true;
      }
    };

    //

    // main logic:

    let set_cursor = cursor => {
      document.body.style.cursor = cursor;
    };

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
