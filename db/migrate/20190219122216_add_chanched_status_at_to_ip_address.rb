class AddChanchedStatusAtToIpAddress < ActiveRecord::Migration[5.2]
  def change
    add_column :ip_addresses, :changed_status_at, :datetime
  end
end
