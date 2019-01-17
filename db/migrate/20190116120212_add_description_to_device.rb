class AddDescriptionToDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.string :description
    end
  end
end
