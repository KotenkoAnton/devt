class Connection < ActiveRecord::Base
  belongs_to :map
  belongs_to :first_object, class_name: 'Connectable', polymorphic: true
  belongs_to :second_object, class_name: 'Connectable', polymorphic: true

  class << self
    def find_by_objects(map_name, first_object, second_object)
      map = Map.find_by(name: map_name)
      find_connection(map, first_object[:id], first_object[:type], second_object[:id], second_object[:type])
    end

    def between_each_other(item_ids, shape_ids)
      item_item = self.where(first_object_type: "Item", second_object_type: "Item",
                             first_object_id: item_ids, second_object_id: item_ids)
      shape_shape = self.where(first_object_type: "Shape", second_object_type: "Shape",
                               first_object_id: shape_ids, second_object_id: shape_ids)
      item_shape = self.where(first_object_type: "Item", second_object_type: "Shape",
                              first_object_id: item_ids, second_object_id: shape_ids)
      shape_item = self.where(first_object_type: "Shape", second_object_type: "Item",
                              first_object_id: shape_ids, second_object_id: item_ids)
      item_item + shape_shape + item_shape + shape_item
    end

    private

    def find_connection(map, first_id, first_type, second_id, second_type)
      con = Connection.find_by(map: map,
                               first_object_type: first_type,
                               first_object_id: first_id,
                               second_object_type: second_type,
                               second_object_id: second_id)
      return con if con

      con = Connection.find_by(map: map,
                               first_object_type: second_type,
                               first_object_id: second_id,
                               second_object_type: first_type,
                               second_object_id: first_id)
      con
    end
  end
end
