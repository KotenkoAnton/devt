class IpLogsController < ApplicationController
  before_action :load_ip_logs, only: :index

  def fetch_page
    render json: { ip_logs: serialize(load_page(params[:page])) }
  end

  private

  def load_ip_logs
    @ip_logs = load_page(1)
  end

  def load_page(page)
    IpLog.includes(ip_address: { devices: { item: :map } }).page(page).order('created_at DESC')
  end

  def serialize(ip_logs)
    ip_logs.as_json(include: {
                      ip_address: {
                        except: %i[created_at updated_at],
                        include: {
                          devices: {
                            include: {
                              item: {
                                include: {
                                  map: { except: %i[created_at updated_at] }
                                }
                              }
                            }
                          }
                        }
                      }
                    })
  end
end
