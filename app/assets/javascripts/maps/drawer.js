"use strict";

class Drawer {
  constructor() {
    this.item_paths = [];
    this.connections = [];
    this.connection_paths = [];
    this.shapes = [];
    this.inscriptions = [];
  }

  draw_connections(connections) {
    this.connections = this.connections.concat(connections);
    for (let connection of connections) {
      this._draw_connection(connection);
    }
  }

  draw_shapes(shapes) {
    for (let shape of shapes) {
      this.draw_shape(shape);
    }
  }

  draw_shape(shape) {
    if (shape.shape == "rectangle") {
      let rectangle = this.draw_rectangle(
        new paper.Point(shape.position_x, shape.position_y),
        new paper.Size(shape.width, shape.height)
      );
      rectangle._id = shape.id;
      rectangle._type = "shape";
      rectangle.icon_final_type = "Shape_Not_Monitored";
      this.shapes.push(rectangle);
    }
  }

  draw_rectangle(point, size) {
    let rectangle = new paper.Path.Rectangle(point, size);
    rectangle.strokeColor = "#808080";
    return rectangle;
  }

  add_rectangle(rectangle) {
    this.shapes.push(rectangle);
  }

  place_items(items) {
    for (let item of items) {
      this.place_item(item);
    }
  }

  place_item(item) {
    let icon_final_type = get_icon_final_type(item);
    let icon = get_icon(icon_final_type);

    let text = item.name;

    let _item = paper.project.importSVG(icon);
    _item.icon_final_type = icon_final_type;
    if (item.placeable_type == "Device") {
      _item.status = item.placeable.ip_address.icmp_available;
    }
    _item.position = { x: item.position_x, y: item.position_y };
    _item.text_content = text;
    _item._id = item.id;
    _item._type = item.placeable_type.toLowerCase();
    _item._icon_type =
      item.placeable_type == "Device" ? item.placeable.host_type_name : "Map";
    this.item_paths.push(_item); // store items in whats_up
    return _item;
  }

  get_item(item_id) {
    return this.item_paths.find(item => {
      return item._id == item_id;
    });
  }

  update_icon(item) {
    const drawed_item_index = this.item_paths.findIndex(
      __item => __item._id == item.id
    );

    let icon_final_type = get_icon_final_type(item);

    const drawed_item = this.item_paths[drawed_item_index];
    let _item = paper.project.importSVG(get_icon(icon_final_type));
    _item.icon_final_type = icon_final_type;
    _item._id = drawed_item._id;
    _item.position = drawed_item.position;
    _item.status = item.placeable.ip_address.icmp_available;
    _item._icon_type = item.placeable.host_type_name;
    _item._type = drawed_item._type;
    _item.text = drawed_item.text;
    _item.text_content = drawed_item.text_content;
    _item.rect = drawed_item.rect;
    drawed_item.remove();
    this.item_paths[drawed_item_index] = _item;
  }

  place_texts(focus_item_id = null) {
    for (let item of this.item_paths) {
      this.place_text(item);
    }
    if (focus_item_id) {
      let focus_item = this.item_paths.find(item => {
        return item.id == focus_item_id;
      });
      focus_item.text.style.fillColor = "white";
      focus_item.rect.style.fillColor = "#54c995";
      setTimeout(() => {
        focus_item.text.style.fillColor = "black";
        focus_item.rect.style.fillColor = "white";
      }, 2500);
    }
  }

  place_inscription(inscription) {
    const point = new paper.Point(
      inscription.position_x,
      inscription.position_y
    );

    let text = new paper.PointText(point);
    text.content = inscription.content;
    text.style = {
      fontSize: inscription.font_size,
      fillColor: inscription.font_color,
      fontFamily: inscription.font_family,
      fontWeight: inscription.font_weight
    };
    text._type = "inscription";
    text.ext_id = inscription.id;
    this.inscriptions.push(text);
  }

  place_inscriptions(inscriptions) {
    inscriptions.forEach(inscription => {
      this.place_inscription(inscription);
    });
  }

  place_text(item) {
    if (item.text) {
      return;
    }
    item.text = new paper.PointText(
      this._point_for_text(item, item.text_content)
    );
    item.text.content = item.text_content;
    item.text.style = {
      fontSize: 13,
      fillColor: "black"
    };
    item.rect = new paper.Path.Rectangle(item.text.bounds);
    item.rect.fillColor = "white";
    item.rect.strokeColor = "white";
    item.text.insertAbove(item.rect);
  }

  _point_for_text(item, content) {
    return new paper.Point(
      item.bounds.x +
        Math.floor(item.bounds.width / 2) -
        Math.floor((content.length / 2) * 6),
      item.bounds.y + item.bounds.height + 14
    );
  }

  get_items() {
    return this.item_paths;
  }

  get_shapes() {
    return this.shapes;
  }

  get_inscriptions() {
    return this.inscriptions;
  }

  delete_item_connections(item_id, type) {
    for (let index = this.connection_paths.length - 1; index >= 0; index--) {
      let connection = this.connection_paths[index];
      if (
        (connection._first_object_id == item_id &&
          connection._first_object_type == type) ||
        (connection._second_object_id == item_id &&
          connection._second_object_type == type)
      ) {
        connection.remove();
        this.connection_paths.splice(index, 1);
      }
    }
  }

  delete_rectangle(id) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.shapes[i]._id == id) {
        this.shapes[i].remove();
        this.shapes.splice(i, 1);
      }
    }
  }

  draw_item_connections(item_id, type) {
    for (let connection of this.connections) {
      if (
        (connection.first_object_id == item_id &&
          connection.first_object_type == type) ||
        (connection.second_object_id == item_id &&
          connection.second_object_type == type)
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
    if (!first_object || !second_object) {
      return;
    }
    let first_bounds = first_object.bounds;
    let second_bounds = second_object.bounds;
    let left_x_difference = first_bounds.x - second_bounds.x;
    let right_x_difference =
      first_bounds.x +
      first_bounds.width -
      (second_bounds.x + second_bounds.width);
    let y_difference = Math.abs(first_bounds.y - second_bounds.y);

    let first_point, second_point;
    let direction_line, first_border, second_border;
    [direction_line, first_border, second_border] =
      Math.abs(left_x_difference) >= y_difference &&
      ((left_x_difference > 0 && right_x_difference > 0) ||
        (left_x_difference < 0 && right_x_difference < 0))
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
    let path = new paper.Path({
      strokeColor: "#61AFE3",
      strokeWidth: 2
    });
    path.moveTo(first_point);
    path.lineTo(second_point);
    path._id = connection.id;
    path._first_object_id = first_object._id;
    path._first_object_type = first_object_type;
    path._second_object_id = second_object._id;
    path._second_object_type = second_object_type;
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
}
