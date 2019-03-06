class Inscription < ActiveRecord::Base
  belongs_to :map

  validates_presence_of :content
  validates_presence_of :position_x
  validates_presence_of :position_y
end
