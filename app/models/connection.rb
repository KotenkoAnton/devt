class Connection < ActiveRecord::Base
  belongs_to :map
  belongs_to :first_object, class_name: 'Connectable', polymorphic: true
  belongs_to :second_object, class_name: 'Connectable', polymorphic: true
end
