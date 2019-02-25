class IpAddress < ActiveRecord::Base
  has_many :devices
  has_many :ip_logs
  validates_uniqueness_of :ip_address
  before_destroy :remove_from_zabbix

  def remove_from_zabbix
    Zabbix.remove(self)
  end

  class << self
    def by_ip(ip)
      IpAddress.find_by(ip_address: ip) || IpAddress.create_new(ip)
    end

    def create_new(ip)
      ip_address = IpAddress.new
      zbx_id = Zabbix.find_host_id(ip) || Zabbix.add_by_ip(ip)[:zbx_id]
      ip_address.attributes = { monitored: true, ip_address: ip, zbx_id: zbx_id, icmp_available: true }
      ip_address.save!
      ip_address
    end
  end
end
