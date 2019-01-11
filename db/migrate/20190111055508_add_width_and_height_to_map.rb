class AddWidthAndHeightToMap < ActiveRecord::Migration[5.2]
  def change
    change_table :maps do |t|
      t.integer :width
      t.integer :height
    end
  end
end
