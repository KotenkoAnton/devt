class Map < ActiveRecord::Base
  belongs_to :parent, class_name: 'Map', optional: true
  has_many :children, class_name: 'Map', foreign_key: 'parent_id'

  has_one :item, as: :placeable
  has_many :receptacles
  has_many :connections
  has_many :shapes

  validates :name, uniqueness: true
  validates :name, presence: true
end
