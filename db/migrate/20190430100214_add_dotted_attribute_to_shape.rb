class AddDottedAttributeToShape < ActiveRecord::Migration[5.2]
  def change
    change_table :shapes do |t|
      t.boolean :dotted
    end
  end
end
