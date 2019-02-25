class IpLog < ActiveRecord::Base
  belongs_to :ip_address

  validates :status, presence: true
end
