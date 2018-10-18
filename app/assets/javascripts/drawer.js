"use strict";

class Drawer {
  constructor() {
    this.item_paths = [];
    this.connections = [];
    this.connection_paths = [];
  }

  draw_connections(connections) {
    this.connections = connections;
    for (let connection of connections) {
      this._draw_connection(connection);
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

  _draw_connection(connection) {
    let first_object =
      connection.first_object_type == "Item"
        ? this._find_item_by_id(connection.first_object_id)
        : null; // replace it with shape logic
    let second_object =
      connection.second_object_type == "Item"
        ? this._find_item_by_id(connection.second_object_id)
        : null; // replace it with shape logic
    let first_bounds = first_object.bounds;
    let second_bounds = second_object.bounds;
    let x_differece = Math.abs(first_bounds.x - second_bounds.x);
    let y_difference = Math.abs(first_bounds.y - second_bounds.y);
    let first_point, second_point;
    if (x_differece >= y_difference) {
      let left, right;
      [right, left] =
        first_bounds.x > second_bounds.x
          ? [first_bounds, second_bounds]
          : [second_bounds, first_bounds];
      first_point = new paper.Point(
        left.x + left.width,
        left.y + Math.floor(left.height / 2)
      );
      second_point = new paper.Point(
        right.x,
        right.y + Math.floor(right.height / 2)
      );
    } else {
      let up, down;
      [up, down] =
        first_bounds.y < second_bounds.y
          ? [first_bounds, second_bounds]
          : [second_bounds, first_bounds];
      first_point = new paper.Point(
        up.x + Math.floor(up.width / 2),
        up.y + up.height + 25
      ); // plus 25 to height for text right below item
      second_point = new paper.Point(
        down.x + Math.floor(down.width / 2),
        down.y
      );
    }
    let path = new paper.Path({ strokeColor: "black" });
    path.moveTo(first_point);
    path.lineTo(second_point);
    path._id = connection.id;
    path._first_object_id = first_object._id;
    path._second_object_id = second_object._id;
    this.connection_paths.push(path);
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
