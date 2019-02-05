module Api
  class MapsController < ApplicationController
    def fetch_device_copy
      item = Item.find(params[:item_id])
      device = item.placeable
      device.display_name.prepend("New_")
      render json: device.as_json(except: %i[created_at updated_at icmp_available id monitored zbx_id])
    end

    def fetch_all_maps_names
      render json: { maps: Map.pluck(:name).reject(&:nil?).sort }
    end

    def fetch_map
      map = Map.find_by(name: params[:map])
      render json: { items: load_items(map), connections: load_connections(map), shapes: load_shapes(map),
                     map_width: map.width, map_height: map.height }
    end

    def fetch_item_info
      item = Item.includes(:placeable).find(params[:item_id])
      placeable = item.placeable
      render json: { name: item.name, host_name: placeable.host_name,
                     ip_address: placeable[:ip_address], status: placeable[:icmp_available],
                     description: placeable.description, address: placeable.address,
                     contacts: placeable.contacts }
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

      return render json: { corrected: false } unless item.position_x <= 150 ||
                                                      map.width - item.position_x <= 150 ||
                                                      item.position_y <= 150 ||
                                                      map.height - item.position_y <= 150

      MapCorrector.correct_on_map(map)
      render json: { corrected: true }
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
    end

    def check_connection_existence
      connection = Connection.find_by_objects(params[:map_name], params[:first_object], params[:second_object])
      connection_id = connection&.id
      render json: { connection_id: connection_id }
    end

    def delete_connection
      connection = Connection.find_by_objects(params[:map_name], params[:first_object], params[:second_object])
      connection.destroy
    end

    def update_device_info
      item = Item.find(params[:item_id])
      device = item.placeable
      device[:description] = params[:description]
      device[:address] = params[:address]
      device[:contacts] = params[:contacts]
      device[:ip_address] = params[:ip_address]
      device.save

      item.name = params[:name]
      item.save
    end

    def add_new_map
      map = Map.new
      map.name = params[:map_name]
      map.width = 400
      map.height = 400
      return render json: { added: true } if map.save

      render json: { added: false }
    end

    def add_device_and_item
      item = Item.new
      Device.transaction do
        device = Device.new
        device.attributes = { display_name: params[:name], ip_address: "127.0.0.1",
                              host_name: "127.0.0.1", host_type_name: params[:placeable][:host_type_name],
                              monitored: false, address: params[:address], description: params[:description],
                              contacts: params[:contacts] }
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
                           position_y: params[:position_y], width: 100, height: 100, shape: "rectangle" }
      shape.save
      render json: { shape_id: shape&.id, shape: shape&.shape, height: shape&.height, width: shape&.width }
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

    def load_items(map)
      Item.where(map: map).as_json(except: %i[created_at updated_at],
                                   include: {
                                     placeable: {
                                       except: %i[created_at updated_at]
                                     }
                                   })
    end

    def load_connections(map)
      Connection.where(map: map).as_json(except: %i[created_at updated_at])
    end

    def load_shapes(map)
      Shape.where(map: map).as_json(except: %i[created_at updated_at])
    end
  end
end
