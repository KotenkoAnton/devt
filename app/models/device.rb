class Device < ActiveRecord::Base
  has_one :item, as: :placeable
end
