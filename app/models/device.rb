class Device < ActiveRecord::Base
  has_one :item, as: :placeable, dependent: :destroy

  # validates_uniqueness_of :ip_address

  class << self
    def by_item_id(item_id)
      Item.find(item_id).placeable
    end
  end
end
