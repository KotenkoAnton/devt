class Device < ActiveRecord::Base
  has_one :item, as: :placeable, dependent: :destroy
  belongs_to :ip_address
  before_destroy :destroy_ip

  def destroy_ip
    ip_address = self.ip_address
    return if ip_address.devices.count > 1

    ip_address.destroy
  end
end
