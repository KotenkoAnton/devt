class IpLog < ActiveRecord::Base
  paginates_per 50
  belongs_to :ip_address

  validates :status, presence: true
end
