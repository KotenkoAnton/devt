class IpLogsController < ApplicationController
  before_action :load_ip_logs, only: :index

  private

  def load_ip_logs
    @ip_logs = IpLog.includes(ip_address: { devices: { item: :map } }).page(params[:page]).order('created_at DESC')
  end
end
