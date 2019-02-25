class CreateIpLog < ActiveRecord::Migration[5.2]
  def change
    create_table :ip_logs do |t|
      t.string :status
      t.integer :ip_address_id

      t.timestamps
    end
  end
end
