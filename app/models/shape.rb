class Shape < ActiveRecord::Base
  belongs_to :map
  has_one :connection, as: :connectable
end
