class CreateIpAddress < ActiveRecord::Migration[5.2]
  def change
    create_table :ip_addresses do |t|
      t.string :ip_address
      t.boolean :monitored
      t.integer :zbx_id
      t.boolean :icmp_available

      t.timestamps
    end
  end
end
