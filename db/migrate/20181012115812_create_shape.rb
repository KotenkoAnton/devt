class CreateShape < ActiveRecord::Migration[5.2]
  def change
    create_table :shapes do |t|
      t.string :shape
      t.integer :map_id
      t.integer :position_x
      t.integer :position_y

      t.timestamps
    end
  end
end
