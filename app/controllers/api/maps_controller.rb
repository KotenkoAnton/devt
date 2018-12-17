module Api
  class MapsController < ApplicationController
    def fetch_map
      map = Map.find_by(name: params[:map])
      render json: { items: load_items(map), connections: load_connections(map), shapes: load_shapes(map) }
    end

    def change_item_position
      position_x = params[:position_x]
      position_y = params[:position_y]
      item_id = params[:item_id]
      item = Item.find(item_id)
      item.position_x = position_x
      item.position_y = position_y
      item.save
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
      first_item = Item.find(params[:first_item_id])
      second_item = Item.find(params[:second_item_id])
      connection = Connection.new
      connection.first_object = first_item
      connection.second_object = second_item
      connection.map = map
      connection.save
    end

    def check_connection_existence
      connection = Connection.find_by_items(params[:map_name], params[:first_item_id], params[:second_item_id])
      connection_id = connection&.id
      render json: { connection_id: connection_id }
    end

    def delete_connection
      connection = Connection.find_by_items(params[:map_name], params[:first_item_id], params[:second_item_id])
      connection.destroy
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
