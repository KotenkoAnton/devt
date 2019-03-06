class CreateInscription < ActiveRecord::Migration[5.2]
  def change
    create_table :inscriptions do |t|
      t.integer :map_id
      t.string :content
      t.integer :font_size
      t.string :font_color
      t.integer :position_x
      t.integer :position_y

      t.timestamps
    end
  end
end
