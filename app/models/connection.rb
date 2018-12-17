class Connection < ActiveRecord::Base
  belongs_to :map
  belongs_to :first_object, class_name: 'Connectable', polymorphic: true
  belongs_to :second_object, class_name: 'Connectable', polymorphic: true

  class << self
    def find_by_items(map_name, first_item_id, second_item_id)
      map = Map.find_by(name: map_name)
      first_item = Item.find(first_item_id)
      second_item = Item.find(second_item_id)
      connection = Connection.find_by(map: map, first_object: first_item, second_object: second_item)
      return connection if connection
      connection = Connection.find_by(map: map, first_object: second_item, second_object: first_item)
      connection
    end
  end
end
