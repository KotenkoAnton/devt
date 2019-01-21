class AddContactsAndAddressToDevice < ActiveRecord::Migration[5.2]
  def change
    change_table :devices do |t|
      t.string :contacts
      t.string :address
    end
  end
end
