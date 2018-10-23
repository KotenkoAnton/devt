class Item < ActiveRecord::Base
  belongs_to :placeable, polymorphic: true
  has_one :connection, as: :connectable
  belongs_to :map

  validates_uniqueness_of :name, scope: :map_id
end
