class AddFontWeightFontFamilyToInscription < ActiveRecord::Migration[5.2]
  def change
    change_table :inscriptions do |t|
      t.string :font_weight
      t.string :font_family
    end
  end
end
