"use strict";

class Drawer {
  constructor() {
    this.item_paths = [];
    this.connections = [];
    this.connection_paths = [];
    this.shapes = [];
  }

  draw_connections(connections) {
    this.connections = connections;
    for (let connection of connections) {
      this._draw_connection(connection);
    }
  }

  draw_shapes(shapes) {
    for (let shape of shapes) {
      if (shape.shape == "rectangle") {
        let rectangle = new paper.Path.Rectangle(
          new paper.Point(shape.position_x, shape.position_y),
          new paper.Size(shape.width, shape.height)
        );
        rectangle.strokeColor = "black";
        rectangle._id = shape.id;
        this.shapes.push(rectangle);
      }
    }
  }

  place_items(items) {
    for (let item of items) {
      let icon =
        item.placeable_type == "Device"
          ? icons[item.placeable.host_type_name]
          : icons["Map"];
      let text = item.name;
      let _item = paper.project.importSVG(icon);
      _item.position = { x: item.position_x, y: item.position_y };
      _item.text = new paper.PointText(this._point_for_text(_item, text));
      _item.text.content = text;
      _item.text.style = {
        fontSize: 14,
        fillColor: "black"
      };
      _item._id = item.id;
      this.item_paths.push(_item); // store items in whats_up
    }
  }

  get_items() {
    return this.item_paths;
  }

  get_shapes() {
    return this.shapes;
  }

  delete_item_connections(item_id) {
    for (let index = this.connection_paths.length - 1; index >= 0; index--) {
      let connection = this.connection_paths[index];
      if (
        connection._first_object_id == item_id ||
        connection._second_object_id == item_id
      ) {
        connection.remove();
        this.connection_paths.splice(index, 1);
      }
    }
  }

  draw_item_connections(item_id) {
    for (let connection of this.connections) {
      if (
        connection.first_object_id == item_id ||
        connection.second_object_id == item_id
      ) {
        this._draw_connection(connection);
      }
    }
  }

  // so called private methods

  _find_item_by_id(item_id) {
    return this.item_paths.find(item => {
      return item._id == item_id;
    });
  }

  _find_shape_by_id(shape_id) {
    return this.shapes.find(shape => {
      return shape._id == shape_id;
    });
  }

  _draw_connection(connection) {
    let first_object_type = connection.first_object_type;
    let second_object_type = connection.second_object_type;
    let first_object =
      first_object_type == "Item"
        ? this._find_item_by_id(connection.first_object_id)
        : this._find_shape_by_id(connection.first_object_id);
    let second_object =
      second_object_type == "Item"
        ? this._find_item_by_id(connection.second_object_id)
        : this._find_shape_by_id(connection.second_object_id);
    let first_bounds = first_object.bounds;
    let second_bounds = second_object.bounds;
    let x_difference = Math.abs(first_bounds.x - second_bounds.x);
    let y_difference = Math.abs(first_bounds.y - second_bounds.y);
    let first_point, second_point;
    let direction_line, first_border, second_border;
    [direction_line, first_border, second_border] =
      x_difference >= y_difference
        ? ["x", "right", "left"]
        : ["y", "down", "up"];
    [first_point, second_point] =
      first_bounds[direction_line] > second_bounds[direction_line]
        ? [
            this._point_for(first_object_type, first_bounds, first_border),
            this._point_for(second_object_type, second_bounds, second_border)
          ]
        : [
            this._point_for(first_object_type, first_bounds, second_border),
            this._point_for(second_object_type, second_bounds, first_border)
          ];
    let path = new paper.Path({ strokeColor: "black" });
    path.moveTo(first_point);
    path.lineTo(second_point);
    path._id = connection.id;
    path._first_object_id = first_object._id;
    path._second_object_id = second_object._id;
    this.connection_paths.push(path);
  }

  _point_for(object_type, object_bounds, position) {
    if (object_type == "Item" || object_type == "Shape") {
      switch (position) {
        case "right": {
          return new paper.Point(
            object_bounds.x,
            object_bounds.y + Math.floor(object_bounds.height / 2)
          );
        }
        case "left": {
          return new paper.Point(
            object_bounds.x + object_bounds.width,
            object_bounds.y + Math.floor(object_bounds.height / 2)
          );
        }
        case "up": {
          let height_plus = object_type == "Item" ? 25 : 0;
          return new paper.Point(
            object_bounds.x + Math.floor(object_bounds.width / 2),
            object_bounds.y + object_bounds.height + height_plus // plus 25 to height for text right below item
          );
        }
        case "down": {
          return new paper.Point(
            object_bounds.x + Math.floor(object_bounds.width / 2),
            object_bounds.y
          );
        }
      }
    }
  }

  _point_for_text(item, content) {
    return new paper.Point(
      item.bounds.x +
        Math.floor(item.bounds.width / 2) -
        Math.floor((content.length / 2) * 8),
      item.bounds.y + item.bounds.height + 14
    );
  }
}
