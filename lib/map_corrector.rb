module MapCorrector
  class << self
    INDENTATION = 100

    def correct_items_position
      Map.all.each do |map|
        correct_on_map(map)
      end
    end

    def correct_on_map(map)
      items = Item.where(map: map)
      shapes = Shape.where(map: map)
      return if (items + shapes).empty?

      min_x = (items + shapes).min_by(&:position_x).position_x
      min_y = (items + shapes).min_by(&:position_y).position_y

      max_x = (items + shapes).max_by(&:position_x).position_x
      max_y = (items + shapes).max_by(&:position_y).position_y

      map.width = max_x - min_x + 3 * INDENTATION
      map.height = max_y - min_y + 3 * INDENTATION
      map.save

      move_by({ x: INDENTATION - min_x, y: INDENTATION - min_y }, map)
    end

    def move_by(shift, map)
      Item.where(map: map).each do |item|
        item.position_x += shift[:x]
        item.position_y += shift[:y]
        item.save
      end

      Shape.where(map: map).each do |shape|
        shape.position_x += shift[:x]
        shape.position_y += shift[:y]
        shape.save
      end
    end
  end
end
