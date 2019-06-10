class ApiCommunicator {
  change_device_host_type_by_item_id(item_id, host_type_name, success = null) {
    $.post({
      url: `${location.origin}/api/maps/change_device_host_type_by_item_id`,
      data: { item_id, host_type_name },
      success: success
    });
  }

  fetch_items_for_list_view(map_name, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_items_for_list_view`,
      data: { map_name },
      success: success
    });
  }

  fetch_items_for_pasting(map_name, children, action, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_items_for_pasting`,
      data: { map_name, children, user_action: action },
      success: success
    });
  }

  fetch_item_logs(item_id, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_item_logs`,
      data: { item_id },
      success: success
    });
  }

  delete_zone_item(item_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_zone_item`,
      data: { item_id },
      success: success
    });
  }

  delete_shape(shape_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_shape`,
      data: { shape_id },
      success: success
    });
  }

  delete_inscription(inscription_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_inscription`,
      data: { inscription_id },
      success: success
    });
  }

  fetch_device_copy(item_id, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_device_copy`,
      data: { item_id },
      success: success
    });
  }

  set_monitoring(ip_address, to, success = null) {
    $.post({
      url: `${location.origin}/api/maps/set_monitoring`,
      data: { ip_address, to },
      success: success
    });
  }

  fetch_all_maps_names(success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_all_maps_names`,
      success: success
    });
  }

  fetch_map(map, success = null) {
    $.get({
      url: `${location.origin}/api/maps/fetch_map`,
      data: { map: map },
      success: success
    });
  }

  add_new_inscription(adding_object, success) {
    $.post({
      url: `${location.origin}/api/maps/add_new_inscription`,
      data: adding_object,
      success: success
    });
  }

  add_new_map(map_name, success = null) {
    $.post({
      url: `${location.origin}/api/maps/add_new_map`,
      data: { map_name },
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

  add_map_item(adding_object, success = null) {
    $.post({
      url: `${location.origin}/api/maps/add_map_item`,
      data: adding_object,
      success: success
    });
  }

  add_shape(adding_object, success = null) {
    $.post({
      url: `${location.origin}/api/maps/add_shape`,
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

  mass_update_position(objects, map_name) {
    $.post({
      url: `${location.origin}/api/maps/mass_update_position`,
      data: { json_objects: JSON.stringify(objects), map_name }
    });
  }

  change_inscription_position(inscription_id, position, success = null) {
    $.post({
      url: `${location.origin}/api/maps/change_inscription_position`,
      data: {
        inscription_id,
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
        host_name: info.host_name,
        ip_address: info.ip_address,
        name: info.name
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

  delete_device_by_item_id(item_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_device_by_item_id`,
      data: {
        item_id: item_id
      },
      success: success
    });
  }

  delete_connections_by_item_id(item_id, success = null) {
    $.post({
      url: `${location.origin}/api/maps/delete_connections_by_item_id`,
      data: {
        item_id: item_id
      },
      success: success
    });
  }
}
