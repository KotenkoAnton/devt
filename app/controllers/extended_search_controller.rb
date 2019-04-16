class ExtendedSearchController < ApplicationController
  def fetch_devices
    devices = Device.includes([:ip_address, item: :map]).map do |device|
      { "0": device.item.name,
        "1": device.ip_address.ip_address,
        "2": device.host_type_name,
        "3": device.address,
        "item_id": device.item.id,
        "map_name": device.item.map.name }
    end
    render json: { devices: devices }
  end
end
