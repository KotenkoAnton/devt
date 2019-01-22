module Api
  class MapsController < ApplicationController
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
      device = Device.by_item_id(params[:item_id])
      device[:description] = params[:description]
      device[:address] = params[:address]
      device[:contacts] = params[:contacts]
      device[:ip_address] = params[:ip_address]
      device.save
    end

    def add_device_and_item
      item = Item.new
      Device.transaction do
        device = Device.new
        device.display_name = params[:name]
        device.ip_address = "127.0.0.1"
        device.host_name = "127.0.0.1"
        device.host_type_name = params[:placeable][:host_type_name]
        device[:monitored] = false
        device.save!

        item.name = params[:name]
        item.position_x = params[:position_x]
        item.position_y = params[:position_y]
        item.placeable = device
        item.map = Map.find_by(name: params[:map_name])
        item.save!
      end
      render json: { item_id: item&.id }
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
