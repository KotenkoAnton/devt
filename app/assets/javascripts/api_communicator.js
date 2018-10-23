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
}
