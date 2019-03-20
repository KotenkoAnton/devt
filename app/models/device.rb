class Device < ActiveRecord::Base
  has_one :item, as: :placeable, dependent: :destroy
  belongs_to :ip_address

  before_destroy :before_destroy
  before_update :before_update, :if => :ip_address_id_changed?

  def before_destroy
    self.ip_address.delete_deprecated
  end

  def before_update
    IpAddress.find(self.ip_address_id_was).delete_deprecated
  end
end
