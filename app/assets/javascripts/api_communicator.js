class ApiCommunicator {
  fetch_map(map, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_map`,
      data: { map: map },
      success: success
    });
  }

  add_device_and_item(adding_object, success = null) {
    $.post({
      url: `${location.origin}/api/maps/add_device_and_item`,
      data: adding_object,
      success: success
    });
  }

  change_item_position(item_id, position, success = null) {
    $.post({
      url: `${location.origin}/api/maps/change_item_position`,
      data: {
        item_id: item_id,
        position_x: position.x,
        position_y: position.y
      },
      success: success
    });
  }

  change_shape_position(shape_id, position) {
    $.post({
      url: `${location.origin}/api/maps/change_shape_position`,
      data: {
        shape_id: shape_id,
        position_x: position.x,
        position_y: position.y
      }
    });
  }

  change_shape_size(shape_id, size, position) {
    $.post({
      url: `${location.origin}/api/maps/change_shape_size`,
      data: {
        shape_id: shape_id,
        width: size.width,
        height: size.height,
        position_x: position.x,
        position_y: position.y
      }
    });
  }

  change_device_info(item_id, info, success) {
    $.post({
      url: `${location.origin}/api/maps/update_device_info`,
      data: {
        item_id: item_id,
        description: info.description,
        address: info.address,
        contacts: info.contacts,
        ip_address: info.ip_address
      },
      success: success
    });
  }

  map_name_by_item_id(item_id, success = null) {
    $.get({
      url: `${location.origin}/api/maps/map_name_by_item_id`,
      data: { item_id: item_id },
      success: success
    });
  }

  create_connection(map_name, first_object, second_object, success = null) {
    $.post({
      url: `${location.origin}/api/maps/create_connection`,
      data: {
        map_name: map_name,
        first_object: {
          type: first_object._type == "shape" ? "Shape" : "Item",
          id: first_object._id
        },
        second_object: {
          type: second_object._type == "shape" ? "Shape" : "Item",
          id: second_object._id
        },
        success: success
      }
    });
  }

  check_connection_existence(map_name, first_object, second_object, success) {
    $.get({
      url: `${location.origin}/api/maps/check_connection_existence`,
      data: {
        map_name: map_name,
        first_object: {
          type: first_object._type == "shape" ? "Shape" : "Item",
          id: first_object._id
        },
        second_object: {
          type: second_object._type == "shape" ? "Shape" : "Item",
          id: second_object._id
        }
      },
      success: success
    });
  }

  delete_connection(map_name, first_object, second_object, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_connection`,
      data: {
        map_name: map_name,
        first_object: {
          type: first_object._type == "shape" ? "Shape" : "Item",
          id: first_object._id
        },
        second_object: {
          type: second_object._type == "shape" ? "Shape" : "Item",
          id: second_object._id
        },
        success: success
      }
    });
  }

  fetch_item_info(item_id, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_item_info`,
      data: { item_id: item_id },
      success: success
    });
  }
}
