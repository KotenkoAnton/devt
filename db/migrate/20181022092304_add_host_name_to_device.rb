class AddHostNameToDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.string :host_name
    end
  end
end
