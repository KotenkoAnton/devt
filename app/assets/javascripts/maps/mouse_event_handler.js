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
    this.selection_rectangle = {};

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

  switch_clickable_mode_to(mode) {
    this.ruler_first_item = undefined;
    this.ruler_second_item = undefined;
    this.clickable_mode = mode;

    if (
      mode == "deleting" &&
      Object.entries(this.selection_rectangle).length != 0 // is selection rectangle is not empty
    ) {
      console.log("start deleting");
      // debugger;
    }

    if (mode == "adding_object") {
      this._set_cursor("pointer");
    } else {
      this._set_cursor("auto");
    }
  }

  get_clickable_mode() {
    return this.clickable_mode;
  }

  set_adding_object(adding_object) {
    $("#action_box").remove();
    this._set_cursor("crosshair");
    this.adding_object = adding_object;
  }

  _set_events() {
    // copy:

    function getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }

    $(document).keydown(e => {
      if (e.key == "v" && e.ctrlKey && $("#complete_editing").is(":visible")) {
        let selection_rectangle_json = getCookie("selection_rectangle");
        if (selection_rectangle_json != "") {
          let selection_rectangle = JSON.parse(selection_rectangle_json);
          const max_y = Math.max.apply(
            Math,
            this.whats_up.drawer.get_items().map(o => o.position.y)
          );
          let start_point = new paper.Point(20, max_y + 100);
          let end_point = new paper.Point(
            100 + selection_rectangle.width,
            max_y + 100 + selection_rectangle.height
          );

          let canvas = $("#canvas");
          canvas[0].height = canvas.height() + selection_rectangle.height;
          canvas.height(canvas.height() + selection_rectangle.height);
          paper.view.setViewSize(
            new paper.Size(canvas.width(), canvas.height())
          );

          selection_rectangle.children.forEach(child => {
            child.position_x = Math.floor(start_point.x + child.offset.x);
            child.position_y = Math.floor(start_point.y + child.offset.y);
            child.offset = undefined;
          });

          const fetch_success = data => {
            this.whats_up.drawer.place_items(data["items"]);
            this.whats_up.drawer.draw_shapes(data["shapes"]);
            this.whats_up.drawer.draw_connections(data["connections"]);
            this.whats_up.drawer.place_texts();
            selection_rectangle.path = draw_selection_rectangle(
              start_point,
              end_point
            );
            selection_rectangle.path._type = "selection_rectangle";
            if (this.selection_rectangle.path) {
              this.selection_rectangle.path.remove();
            }
            this.selection_rectangle = {
              children: [],
              drawing: false,
              drawn: true,
              path: selection_rectangle.path,
              start_point
            };
            $("#canvas_wrapper").scrollTop(max_y);
            $("#canvas_wrapper").scrollLeft(10);
            _fill_selection_rectangle_children();
          };

          this.whats_up.api_communicator.fetch_items_for_pasting(
            this.whats_up.map_name,
            selection_rectangle.children,
            selection_rectangle.action,
            fetch_success
          );
          document.cookie =
            "selection_rectangle=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        return;
      }
      if (
        e.ctrlKey &&
        (e.key == "c" || e.key == "x") &&
        this.selection_rectangle.path
      ) {
        let cookie_object = {};
        cookie_object.width = this.selection_rectangle.path.bounds.width;
        cookie_object.height = this.selection_rectangle.path.bounds.height;
        cookie_object.action = e.key == "c" ? "copy" : "cut";
        cookie_object.children = [];
        this.selection_rectangle.children.forEach(child => {
          cookie_object.children.push({
            id: child.id,
            offset: child.offset,
            type: child._type
          });
        });

        document.cookie = `selection_rectangle=${JSON.stringify(
          cookie_object
        )}`;
        return;
      }
    });

    //

    // draggable:

    let _fill_selection_rectangle_children = () => {
      this.selection_rectangle.children = [];

      let is_inside = (rectangle, item) => {
        const rectangle_bounds = rectangle.bounds;
        return (
          rectangle_bounds.x < item.bounds.x &&
          rectangle_bounds.x + rectangle_bounds.width >
            item.bounds.x + item.bounds.width &&
          rectangle_bounds.y < item.bounds.y &&
          rectangle_bounds.y + rectangle_bounds.height >
            item.bounds.y + item.bounds.height
        );
      };
      this.whats_up.drawer.get_items().forEach(item => {
        if (is_inside(this.selection_rectangle.path, item)) {
          item.offset = {
            x: item.position.x - this.selection_rectangle.path.bounds.x,
            y: item.position.y - this.selection_rectangle.path.bounds.y
          };
          this.selection_rectangle.children.push(item);
        }
      });
      this.whats_up.drawer.get_shapes().forEach(shape => {
        if (is_inside(this.selection_rectangle.path, shape)) {
          shape.offset = {
            x:
              shape.position.x -
              this.selection_rectangle.path.bounds.x -
              Math.floor(shape.bounds.width / 2),
            y:
              shape.position.y -
              this.selection_rectangle.path.bounds.y -
              Math.floor(shape.bounds.height / 2)
          };
          this.selection_rectangle.children.push(shape);
        }
      });
    };

    let draggable_mouse_down = event => {
      // start mass selection if ctrl is pressed
      if (
        event.event.shiftKey &&
        this.selection_rectangle.start_point == undefined
      ) {
        this.selection_rectangle = { start_point: event.point, drawing: true };
        return;
      }

      if (this.expanding_hover && !event.event.altKey) {
        this.expanding = true;
        this.whats_up.drawer.delete_item_connections(
          this.moving_target._id,
          "Shape"
        );
        return;
      }
      let item = target_item(event.point);
      // remove selection rectangle if not target
      if (!item) {
        if (this.selection_rectangle.drawn) {
          this.selection_rectangle.path.remove();
        }
        this.selection_rectangle = {};
      } else {
        if (
          this.selection_rectangle.drawn &&
          item._type != "selection_rectangle"
        ) {
          this.selection_rectangle.path.remove();
        }
        if (item._type == "selection_rectangle") {
          this.selection_rectangle.children.forEach(child => {
            this.whats_up.drawer.delete_item_connections(
              child._id,
              child._type == "shape" ? "Shape" : "Item"
            );
          });
        }
      }
      // start scrolling
      if (
        event.event.altKey &&
        !this.box_opened &&
        this.clickable_mode == "main_usage"
      ) {
        this.scrolling = true;
        this._set_cursor("move");
        this.scrolling_first_position = {
          x: event.event.clientX,
          y: event.event.clientY
        };
        return;
      }

      //

      if (!item) {
        return;
      }
      this.moving = true;
      this.moving_target = item;
      this.moving_target.point_diff = {
        x_diff: this.moving_target.position.x - event.point.x,
        y_diff: this.moving_target.position.y - event.point.y
      };
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
      const x_shift =
        this.moving_target.position.x -
        this.moving_target.point_diff.x_diff -
        event_point.x;
      const y_shift =
        this.moving_target.position.y -
        this.moving_target.point_diff.y_diff -
        event_point.y;

      _move_target_by_shift(this.moving_target, event_point, {
        x: x_shift,
        y: y_shift
      });

      if (this.moving_target._type == "selection_rectangle") {
        this.selection_rectangle.children.forEach(child => {
          _move_target_by_shift(child, event_point, {
            x: x_shift,
            y: y_shift
          });
        });
      }

      // expand the map if the item is near the edge
      let canvas = $("#canvas");

      if ($("#canvas").width() - this.moving_target.position.x < 200) {
        canvas[0].width = canvas.width() + 500;
        canvas.width(canvas.width() + 500);
        paper.view.setViewSize(new paper.Size(canvas.width(), canvas.height()));
      }

      if ($("#canvas").height() - this.moving_target.position.y < 200) {
        canvas[0].height = canvas.height() + 500;
        canvas.height(canvas.height() + 500);
        paper.view.setViewSize(new paper.Size(canvas.width(), canvas.height()));
      }

      //
    };

    let _move_target_by_shift = (target, event_point, shift) => {
      target.position.x -= shift.x;
      target.position.y -= shift.y;
      if (!target.text) {
        return;
      }
      target.text.position.x -= shift.x;
      target.text.position.y -= shift.y;
      target.rect.position.x -= shift.x;
      target.rect.position.y -= shift.y;
    };

    let draw_selection_rectangle = (start_point, end_point) => {
      let rectangle = new paper.Rectangle(start_point, end_point);
      let path = new paper.Path.Rectangle(rectangle);
      path.strokeColor = "blue";
      path.dashArray = [10, 12];
      return path;
    };

    let draggable_mouse_move = event => {
      // check for mass selection drawing
      if (this.selection_rectangle.drawing) {
        if (this.selection_rectangle.path) {
          this.selection_rectangle.path.remove();
        }
        this.selection_rectangle.path = draw_selection_rectangle(
          this.selection_rectangle.start_point,
          event.point
        );
        return;
      }

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
      if (this.selection_rectangle.drawing) {
        this.selection_rectangle.drawing = false;
        this.selection_rectangle.drawn = true;
        this.selection_rectangle.path._type = "selection_rectangle";
        _fill_selection_rectangle_children();
        return;
      }

      if (this.selection_rectangle.drawn) {
        let objects_to_update = [];
        this.selection_rectangle.children.forEach(child => {
          const type = child._type == "shape" ? "Shape" : "Item";
          this.whats_up.drawer.draw_item_connections(child._id, type);
          let position;
          if (type == "Item") {
            position = { x: child.position.x, y: child.position.y };
          } else {
            // for shape
            position = {
              x: Math.floor(child.position.x - child.bounds.width / 2),
              y: Math.floor(child.position.y - child.bounds.height / 2)
            };
          }

          objects_to_update.push({ id: child._id, type: type, position });
        });
        this.whats_up.api_communicator.mass_update_position(
          objects_to_update,
          this.whats_up.map_name
        );
        this.selection_rectangle.path.remove();
        this.selection_rectangle = {};
      }

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
            event.point
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
      let rect = this.whats_up.drawer.draw_rectangle(
        point,
        size,
        this.moving_target.dotted,
        this.moving_target.radius,
        this.moving_target.fill_color
      );
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
      let target = target_item(event.point);

      // start scrolling
      if (
        (!target || target._type == "shape") &&
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
              this.whats_up.dom_elements_handler.open_item_box(
                item,
                data,
                event.event
              );
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
        // set button and cursor to default
        $("body").css({ cursor: "default" });
        this.whats_up.control_buttons_state_handler.set_all_buttons_to_neutral();
        //
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

      if (this.selection_rectangle.path) {
        const rectangle_bounds = this.selection_rectangle.path.bounds;
        if (
          rectangle_bounds.x < event.point.x &&
          rectangle_bounds.x + rectangle_bounds.width > event.point.x &&
          rectangle_bounds.y < event.point.y &&
          rectangle_bounds.y + rectangle_bounds.height > event.point.y
        ) {
          this.whats_up.dom_elements_handler.open_confirm_deleting_box(
            { ids: this.selection_rectangle.children.map(item => item._id) },
            false
          );
          return;
        }
      }

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
        case "device": {
          whats_up.mouse_event_handler.switch_to("clickable");
          whats_up.mouse_event_handler.switch_clickable_mode_to("main_usage");
          $("body").css({ cursor: "auto" });
          this.whats_up.api_communicator.fetch_item_info(item._id, data => {
            data.id = item._id;
            this.whats_up.dom_elements_handler.open_confirm_deleting_box(data);
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
      this.switch_to("draggable");
      let reverse_scale = 1 + (1 - paper.project.view.scaling.x);
      this.adding_object.position_x =
        event.event.layerX * reverse_scale +
        ((reverse_scale * 10) % 10) * 4 +
        event.event.layerX / 50;
      this.adding_object.position_y =
        event.event.layerY * reverse_scale + ((reverse_scale * 10) % 10) * 16;

      this.adding_object.map_name = this.whats_up.map_name;
      switch (this.adding_object.placeable_type) {
        case "Device": {
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
          this.adding_object.position_x =
            (this.adding_object.position_x + 1) * reverse_scale;
          this.adding_object.position_y =
            (this.adding_object.position_y - 5) * reverse_scale;
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
          this.adding_object.position_x *= reverse_scale;
          this.adding_object.position_y *= reverse_scale;
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
      if (this.selection_rectangle.drawn) {
        if (is_target(this.selection_rectangle.path, event_point)) {
          // this.selection_rectangle.path.type = "selection_rectangle";
          return this.selection_rectangle.path;
        }
      }
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
