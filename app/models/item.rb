class Item < ActiveRecord::Base
  belongs_to :placeable, polymorphic: true
  has_many :cons1, as: :first_object, class_name: 'Connection'
  has_many :cons2, as: :second_object, class_name: 'Connection'
  belongs_to :map

  validates_uniqueness_of :name, scope: :map_id

  before_destroy :delete_connections

  def connections
    self.cons1 + self.cons2
  end

  def delete_connections
    self.cons1.destroy_all
    self.cons2.destroy_all
  end

  class << self
    def search_by_name(name)
      self.where("placeable_type = 'Device' and name ~* ?", name).as_json(only: %i[id name],
                                                                          include: {
                                                                            map: { only: :name },
                                                                            placeable: {
                                                                              only: :id,
                                                                              include: {
                                                                                ip_address: { only: %i[icmp_available ip_address] }
                                                                              }
                                                                            }
                                                                          })
    end

    def search_by_ip(ip)
      items = []
      IpAddress.where("ip_address ~* ?", ip).includes(devices: { item: :map }).each do |ip_address|
        ip_address.devices.each do |device|
          items << { id: device.item.id,
                     name: device.item.name,
                     map: { name: device.item.map.name },
                     placeable: { ip_address: { ip_address: ip_address.ip_address, icmp_available: ip_address.icmp_available } } }
        end
      end
      items
    end
  end
end
