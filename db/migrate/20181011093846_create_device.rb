class CreateDevice < ActiveRecord::Migration[5.2]
  def change
    create_table :devices do |t|
      t.string :display_name
      t.string :ip_address
      t.string :host_type_name
      t.boolean :monitored

      t.timestamps
    end
  end
end
