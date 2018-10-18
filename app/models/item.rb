class Item < ActiveRecord::Base
  belongs_to :placeable, polymorphic: true
  has_one :connection, as: :connectable
  belongs_to :map
end
