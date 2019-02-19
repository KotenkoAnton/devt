class Item < ActiveRecord::Base
  belongs_to :placeable, polymorphic: true
  has_many :cons1, as: :first_object, class_name: 'Connection'
  has_many :cons2, as: :second_object, class_name: 'Connection'
  belongs_to :map

  validates_uniqueness_of :name, scope: :map_id

  before_destroy :delete_connections

  include PgSearch
  pg_search_scope :search, against: :name

  def connections
    self.cons1 + self.cons2
  end

  def delete_connections
    self.cons1.destroy_all
    self.cons2.destroy_all
  end
end
