class RemoveFieldsFromDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.remove :ip_address
      t.remove :monitored
      t.remove :zbx_id
      t.remove :icmp_available
    end
  end
end
