class AddZbxIdToDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.integer :zbx_id
    end
  end
end
