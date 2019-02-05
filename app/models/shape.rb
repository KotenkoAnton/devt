class Shape < ActiveRecord::Base
  belongs_to :map
  has_many :cons1, as: :first_object, class_name: 'Connection'
  has_many :cons2, as: :second_object, class_name: 'Connection'

  before_destroy :delete_connections

  def connections
    self.cons1 + self.cons2
  end

  def delete_connections
    self.cons1.destroy_all
    self.cons2.destroy_all
  end
end
