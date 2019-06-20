module Api
  class MapsController < ApplicationController
    def find_items
      items_by_name = Item.search_by_name(params[:search_str])
      items_by_ip = Item.search_by_ip(params[:search_str])
      render json: { items: items_by_name + items_by_ip, search_str: params[:search_str] }
    end

    def fetch_device_copy
      item = Item.find(params[:item_id])
      device = item.placeable
      device.display_name.prepend("New_")
      render json: device.as_json(except: %i[created_at updated_at id])
    end

    def fetch_all_maps_names
      render json: { maps: Map.pluck(:name).reject(&:nil?).sort }
    end

    def fetch_map
      map = Map.find_by(name: params[:map])
      render json: { items: load_items(map), connections: load_connections(map), shapes: load_shapes(map),
                     inscriptions: load_inscriptions(map),
                     map_width: map.width, map_height: map.height }
    end

    def fetch_item_info
      item = Item.includes(placeable: :ip_address).find(params[:item_id])
      placeable = item.placeable
      ip_logs =
        placeable.ip_address.ip_logs.last(6).reverse.map do |ip_log|
          { status: ip_log.status, date: ip_log.created_at.strftime("%d/%m/%y %H:%M:%S") }
        end

      render json: { name: item.name, host_name: placeable.host_name,
                     ip_address: placeable.ip_address[:ip_address], status: placeable.ip_address[:icmp_available],
                     description: placeable.description, address: placeable.address, host_type_name: item.placeable.host_type_name,
                     contacts: placeable.contacts, logs: ip_logs, monitored: placeable.ip_address[:monitored],
                     changed_status_at: placeable.ip_address[:changed_status_at]&.strftime("%d/%m/%y %H:%M:%S") }
    end

    def set_monitoring
      ip_address = IpAddress.find_by(ip_address: params[:ip_address])
      ip_address.monitored = params[:to]
      ip_address.save
      render json: { icmp_available: ip_address[:icmp_available],
                     monitored: ip_address[:monitored],
                     changed_status_at: ip_address[:changed_status_at]&.strftime("%d/%m/%y %H:%M:%S") }
    end

    def fetch_items_for_list_view
      map = Map.find_by(name: params[:map_name])
      devices_items = Item.where(map: map, placeable_type: "Device").includes(placeable: :ip_address).order(:name)
      zones_items = Item.where(map: map, placeable_type: "Map")

      devices = devices_items.map do |item|
        { ip: item.placeable.ip_address.ip_address, icmp_available: item.placeable.ip_address.icmp_available,
          name: item.name, type: item.placeable.host_type_name,
          changed_status_at: item.placeable.ip_address[:changed_status_at]&.strftime("%d/%m/%y %H:%M:%S"),
          item_id: item.id }
      end
      zones = zones_items.map do |item|
        { name: item.name, type: "Zone", item_id: item.id }
      end
      all = (devices + zones).sort_by { |item| item[:name] }
      render json: { items: all }
    end

    def fetch_item_logs
      item = Item.find(params[:item_id])
      ip_address = item.placeable.ip_address
      logs = IpLog.where(ip_address: ip_address).order(created_at: :desc).map do |log|
        { status: log[:status], created_at: log[:created_at].strftime("%d/%m/%y %H:%M:%S") }
      end

      render json: { logs: logs }
    end

    # rubocop:disable all
    # complex method, it is not worth stylizing under rubokop

    def fetch_items_for_pasting
      map = Map.find_by(name: params[:map_name])
      devices = []
      maps = []
      shapes = []
      items_ids = []
      shapes_ids = []
      params[:children].each do |child|
        object_info = child.second.permit(%i[id position_x position_y type]).to_h
        # if item
        if object_info[:type] != "shape"
          original_item = Item.find(object_info[:id])
          case original_item.placeable_type
          when "Device"
            new_placeable = Device.new
            original_device = original_item.placeable
            new_placeable.attributes = { display_name: original_device.display_name,
                                         host_type_name: original_device.host_type_name,
                                         host_name: original_device.host_name,
                                         description: original_device.description,
                                         contacts: original_device.contacts,
                                         address: original_device.address,
                                         ip_address: original_device.ip_address }

            new_item = Item.new
            new_item.attributes = { name: original_item.name,
                                    position_x: object_info[:position_x],
                                    position_y: object_info[:position_y],
                                    placeable: new_placeable,
                                    map: map }
            new_item.save!
            devices << new_item
            items_ids << { original: original_item.id, new: new_item.id }
          when "Map"
            new_item = Item.new
            new_item.attributes = { name: original_item.name,
                                    position_x: object_info[:position_x],
                                    position_y: object_info[:position_y],
                                    placeable: original_item.placeable,
                                    map: map }
            new_item.save!
            maps << new_item
            items_ids << { original: original_item.id, new: new_item.id }
          end
        else
          # if shape
          original_shape = Shape.find(object_info[:id])
          new_shape = Shape.new
          new_shape.attributes = { shape: original_shape.shape,
                                   map: map,
                                   position_x: object_info[:position_x],
                                   position_y: object_info[:position_y],
                                   width: original_shape.width,
                                   height: original_shape.height,
                                   radius: original_shape.radius,
                                   rays_amount: original_shape.rays_amount,
                                   outside_diameter: original_shape.outside_diameter,
                                   inside_diameter: original_shape.inside_diameter }
          new_shape.save!
          shapes << new_shape
          shapes_ids << { original: original_shape.id, new: new_shape.id }
        end
      end

      original_connections = Connection.between_each_other(items_ids.map { |items_id| items_id[:original] },
                                                           shapes_ids.map { |shape_id| shape_id[:original] })
      connections = []
      original_connections.each do |original_connection|
        new_connection = Connection.new
        first_object = Item.find(items_ids.find { |item_id| item_id[:original] == original_connection.first_object_id }[:new]) if original_connection.first_object_type == "Item"
        first_object = Shape.find(shapes_ids.find { |shape_id| shape_id[:original] == original_connection.first_object_id }[:new]) if original_connection.first_object_type == "Shape"
        second_object = Item.find(items_ids.find { |item_id| item_id[:original] == original_connection.second_object_id }[:new]) if original_connection.second_object_type == "Item"
        second_object = Shape.find(shapes_ids.find { |shape_id| shape_id[:original] == original_connection.second_object_id }[:new]) if original_connection.second_object_type == "Shape"
        new_connection.attributes = { map: map, first_object: first_object, second_object: second_object }
        connections << new_connection if new_connection.save!
      end
      devices_json = devices.as_json(except: %i[created_at updated_at],
                                     include: {
                                       placeable: {
                                         except: %i[created_at updated_at],
                                         include: {
                                           ip_address: { except: %i[created_at updated_at] }
                                         }
                                       }
                                     })
      maps_json = maps.as_json(except: %i[created_at updated_at],
                               include: {
                                 placeable: { except: %i[created_at updated_at] }
                               })

      if params[:user_action] == "cut"
        params[:children].each do |child|
          object_info = child.second.permit(%i[id position_x position_y type]).to_h
          Item.find(object_info[:id]).destroy if object_info[:type] != "shape"
          Shape.find(object_info[:id]).destroy if object_info[:type] == "shape"
        end
      end

      render json: { items: devices_json + maps_json,
                     shapes: shapes.as_json(except: %i[created_at updated_at]),
                     connections: connections.as_json(except: %i[created_at updated_at]) }
    end

    # rubocop:enable all

    def change_device_host_type_by_item_id
      device = Item.find(params[:item_id]).placeable
      device.host_type_name = params[:host_type_name]
      device.save
      render json: { changed_status_at: device.ip_address[:changed_status_at]&.strftime("%d/%m/%y %H:%M:%S") }
    end

    def change_item_position
      position_x = params[:position_x]
      position_y = params[:position_y]
      item_id = params[:item_id]
      item = Item.find(item_id)
      item.position_x = position_x
      item.position_y = position_y
      map = item.map
      item.save
      MapCorrector.correct_on_map(map)
    end

    def change_inscription_position
      inscription = Inscription.find(params[:inscription_id])
      inscription.position_x = params[:position_x]
      inscription.position_y = params[:position_y]
      inscription.save
    end

    def change_shape_position
      shape = Shape.find(params[:shape_id])
      shape.position_x = params[:position_x]
      shape.position_y = params[:position_y]
      shape.save
    end

    def change_shape_size
      shape = Shape.find(params[:shape_id])
      shape.position_x = params[:position_x]
      shape.position_y = params[:position_y]
      shape.width = params[:width]
      shape.height = params[:height]
      shape.save
    end

    def mass_update_position
      objects = JSON.parse(params["json_objects"])
      objects.each do |obj|
        object =
          case obj["type"]
          when "Item"
            Item.find(obj["id"])
          when "Shape"
            Shape.find(obj["id"])
          end
        object.position_x = obj["position"]["x"]
        object.position_y = obj["position"]["y"]
        object.save
      end
      MapCorrector.correct_on_map(Map.find_by(name: params[:map_name]))
    end

    def map_name_by_item_id
      item = Item.find(params[:item_id])
      render json: { map_name: Map.find(item.placeable_id).name }
    end

    def create_connection
      map = Map.find_by(name: params[:map_name])
      first_object = params[:first_object][:type].constantize.find(params[:first_object][:id])
      second_object = params[:second_object][:type].constantize.find(params[:second_object][:id])
      connection = Connection.new
      connection.first_object = first_object
      connection.second_object = second_object
      connection.map = map
      connection.save
      render json: { map_id: map.id,
                     first_object_id: first_object.id, first_object_type: params[:first_object][:type],
                     second_object_id: second_object.id, second_object_type: params[:second_object][:type],
                     id: connection.id }
    end

    def check_connection_existence
      connection = Connection.find_by_objects(params[:map_name], params[:first_object], params[:second_object])
      connection_id = connection&.id
      render json: { connection_id: connection_id }
    end

    def delete_connection
      connection = Connection.find_by_objects(params[:map_name], params[:first_object], params[:second_object])
      connection.destroy
      render json: { connection_id: connection.id }
    end

    def delete_inscription
      Inscription.find(params[:inscription_id]).destroy
    end

    def delete_shape
      Shape.find(params[:shape_id]).destroy
    end

    def update_device_info
      item = Item.find(params[:item_id])
      device = item.placeable
      device[:host_name] = params[:host_name]
      device[:description] = params[:description]
      device[:address] = params[:address]
      device[:contacts] = params[:contacts]
      device.ip_address = IpAddress.by_ip(params[:ip_address])
      device.save

      item.name = params[:name]
      item.save

      render json: { icmp_available: device.ip_address.icmp_available,
                     changed_status_at: device.ip_address.updated_at,
                     ip_address: device.ip_address.ip_address }
    end

    def add_new_map
      map = Map.new
      map.name = params[:map_name]
      map.width = 400
      map.height = 400
      return render json: { added: true } if map.save

      render json: { added: false }
    end

    def add_new_inscription
      inscription = Inscription.create(content: params[:content], font_size: params[:font_size],
                                       font_color: params[:font_color], font_weight: params[:font_weight],
                                       font_family: params[:font_family], position_x: params[:position_x],
                                       position_y: params[:position_y], map: Map.find_by(name: params[:map_name]))
      render json: { id: inscription&.id }
    end

    def add_device_and_item
      item = Item.new
      Device.transaction do
        device = Device.new
        ip_address = IpAddress.find_by(ip_address: "127.0.0.1")
        device.attributes = { display_name: params[:name], ip_address: ip_address,
                              host_name: "127.0.0.1", host_type_name: params[:placeable][:host_type_name],
                              address: params[:address], description: params[:description], contacts: params[:contacts] }
        device.save!

        item.attributes = { position_x: params[:position_x], position_y: params[:position_y],
                            placeable: device, map: Map.find_by(name: params[:map_name]),
                            name: params[:name] }
        item.save!
      end
      render json: { item_id: item&.id }
    end

    def add_shape
      shape = Shape.new
      shape.attributes = { map: Map.find_by(name: params[:map_name]), position_x: params[:position_x],
                           position_y: params[:position_y], width: 100, height: 100, shape: "rectangle",
                           dotted: params[:dotted], radius: params[:radius], fill_color: params[:fill_color] }
      shape.save
      render json: { shape_id: shape&.id, shape: shape&.shape, height: shape&.height,
                     width: shape&.width, dotted: shape&.dotted, radius: shape&.radius }
    end

    def delete_device_by_item_id
      item = Item.find(params[:item_id])
      item.placeable.destroy
    end

    def delete_connections_by_item_id
      item = Item.find(params[:item_id])
      item.delete_connections
    end

    def add_map_item
      map = Map.find_by(name: params[:map_name])
      destination_map = Map.find_by(name: params[:destination_map_name])
      item = Item.new
      item.position_x = params[:position_x]
      item.position_y = params[:position_y]
      item.name = params[:name]
      item.map = map
      item.placeable = destination_map
      item.save
      render json: { item_id: item&.id }
    end

    def delete_zone_item
      item = Item.find(params[:item_id])
      item.destroy
    end

    private

    def load_inscriptions(map)
      Inscription.where(map: map).as_json(except: %i[created_at updated_at])
    end

    def load_items(map)
      devices = Item.where(map: map, placeable_type: 'Device').includes(placeable: :ip_address)
      maps = Item.where(map: map, placeable_type: 'Map').includes(:placeable)

      devices_json = devices.as_json(except: %i[created_at updated_at],
                                     include: {
                                       placeable: {
                                         except: %i[created_at updated_at],
                                         include: {
                                           ip_address: { except: %i[created_at updated_at] }
                                         }
                                       }
                                     })
      maps_json = maps.as_json(except: %i[created_at updated_at],
                               include: {
                                 placeable: { except: %i[created_at updated_at] }
                               })
      devices_json + maps_json
    end

    def load_connections(map)
      Connection.where(map: map).as_json(except: %i[created_at updated_at])
    end

    def load_shapes(map)
      Shape.where(map: map).as_json(except: %i[created_at updated_at])
    end
  end
end
