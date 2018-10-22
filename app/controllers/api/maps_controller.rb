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
