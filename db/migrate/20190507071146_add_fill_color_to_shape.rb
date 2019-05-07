class AddFillColorToShape < ActiveRecord::Migration[5.2]
  def change
    change_table :shapes do |t|
      t.string :fill_color
    end
  end
end
