class AddIcmpAvailableFlagToDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.boolean :icmp_available
    end
  end
end
