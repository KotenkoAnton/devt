class CreateConnection < ActiveRecord::Migration[5.2]
  def change
    create_table :connections do |t|
      t.integer :map_id
      t.references :first_object, polymorphic: true
      t.references :second_object, polymorphic: true

      t.timestamps
    end
  end
end
