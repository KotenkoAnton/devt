class CreateItem < ActiveRecord::Migration[5.2]
  def change
    create_table :items do |t|
      t.string :name
      t.integer :position_x
      t.integer :position_y
      t.references :placeable, polymorphic: true
      t.integer :map_id

      t.timestamps
    end
  end
end
