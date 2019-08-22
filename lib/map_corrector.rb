module MapCorrector
  class << self
    INDENTATION = 100
    MIN_WIDTH = 1150
    MIN_HEIGHT = 890

    def correct_items_position
      Map.all.each do |map|
        correct_on_map(map)
      end
    end

    def correct_on_map(map)
      items = Item.where(map: map)
      shapes = Shape.where(map: map)
      inscriptions = Inscription.where(map: map)
      return if (items + shapes + inscriptions).empty?

      min_x = (items + shapes + inscriptions).min_by(&:position_x).position_x
      min_y = (items + shapes + inscriptions).min_by(&:position_y).position_y

      max_x = (items + shapes + inscriptions).max_by(&:position_x).position_x
      max_y = (items + shapes + inscriptions).max_by(&:position_y).position_y

      # TODO: find out whats going on here. When using map.update_attributes, it fires update on item.placeable_id
      Map.find(map.id).update_attributes(width: [max_x - min_x + 3 * INDENTATION, MIN_WIDTH].max,
                                         height: [max_y - min_y + 3 * INDENTATION, MIN_HEIGHT].max)

      move_by({ x: INDENTATION - min_x, y: INDENTATION - min_y }, map)
    end

    def move_by(shift, map)
      items = Item.where(map: map)
      items.each do |item|
        item.position_x += shift[:x]
        item.position_y += shift[:y]
      end
      one_query_position_update(Item, items)

      shapes = Shape.where(map: map)
      shapes.each do |shape|
        shape.position_x += shift[:x]
        shape.position_y += shift[:y]
      end
      one_query_position_update(Shape, shapes)

      inscriptions = Inscription.where(map: map)
      inscriptions.each do |inscription|
        inscription.position_x += shift[:x]
        inscription.position_y += shift[:y]
      end
      one_query_position_update(Inscription, inscriptions)
    end

    def one_query_position_update(model, records)
      return if records.empty?

      query =
        """
        update #{model.table_name} as record set
          position_x = new_data.position_x,
          position_y = new_data.position_y
        from (values
          #{records.map { |r| "(#{r.id}, #{r.position_x}, #{r.position_y})" }.join(',')}
        ) as new_data(id, position_x, position_y)
        where record.id = new_data.id;
        """
      ActiveRecord::Base.connection.execute(query)
    end
  end
end
