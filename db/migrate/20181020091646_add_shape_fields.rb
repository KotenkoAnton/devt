class AddShapeFields < ActiveRecord::Migration[5.2]
  def change
    change_table :shapes do |t|
      t.integer :width
      t.integer :height
      t.integer :radius
      t.integer :rays_amount
      t.integer :outside_diameter
      t.integer :inside_diameter
    end
  end
end
