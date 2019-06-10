class Map < ActiveRecord::Base
  belongs_to :parent, class_name: 'Map', optional: true
  has_many :children, class_name: 'Map', foreign_key: 'parent_id'

  has_many :items
  has_many :receptacles
  has_many :connections
  has_many :shapes

  has_many :devices, through: :items, source: :placeable, source_type: "Device"
  has_many :ip_addresses, through: :devices

  validates :name, uniqueness: true
  validates :name, presence: true

  def availability_count
    available_count = 0
    not_available_count = 0
    self.ip_addresses.each do |ip_address|
      available_count += 1 if ip_address.icmp_available
      not_available_count += 1 unless ip_address.icmp_available
    end
    { available_count: available_count, not_available_count: not_available_count }
  end
end
