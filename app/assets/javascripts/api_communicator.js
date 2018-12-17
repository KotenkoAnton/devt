class ApiCommunicator {
  fetch_map(map, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_map`,
      data: { map: map },
      success: success
    });
  }

  change_item_position(item_id, position) {
    $.post({
      url: `${location.origin}/api/maps/change_item_position`,
      data: { item_id: item_id, position_x: position.x, position_y: position.y }
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

  map_name_by_item_id(item_id, success = null) {
    $.get({
      url: `${location.origin}/api/maps/map_name_by_item_id`,
      data: { item_id: item_id },
      success: success
    });
  }

  create_connection(map_name, first_item_id, second_item_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/create_connection`,
      data: {
        map_name: map_name,
        first_item_id: first_item_id,
        second_item_id: second_item_id,
        success: success
      }
    });
  }

  check_connection_existence(map_name, first_item_id, second_item_id, success) {
    $.get({
      url: `${location.origin}/api/maps/check_connection_existence`,
      data: {
        map_name: map_name,
        first_item_id: first_item_id,
        second_item_id: second_item_id
      },
      success: success
    });
  }

  delete_connection(map_name, first_item_id, second_item_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_connection`,
      data: {
        map_name: map_name,
        first_item_id: first_item_id,
        second_item_id: second_item_id,
        success: success
      }
    });
  }
}
