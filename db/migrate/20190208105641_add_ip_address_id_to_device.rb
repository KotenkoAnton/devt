class AddIpAddressIdToDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.references :ip_address, index: true
    end
  end
end
