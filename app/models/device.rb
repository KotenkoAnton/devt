class Device < ActiveRecord::Base
  has_one :item, as: :placeable

  validates_uniqueness_of :ip_address
end
