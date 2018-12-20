module Api
  class DevicesController < ApplicationController
    protect_from_forgery with: :null_session
    include AccessApiAuth

    def update_status
      return err("Bad parameters", 422) unless params[:ip_address] && params[:status]

      device = Device.find_by(ip_address: params[:ip_address])
      return err("Record not found", 404) unless device

      case params[:status]
      when "down"
        device.icmp_available = false
      when "up"
        device.icmp_available = true
      else
        return err("Bad parameters", 422)
      end
      return render json: { status: "Success" }, status: 200 if device.save

      render json: { status: "Could not save the record" }, status: 200
    end

    private

    def err(description, status)
      render json: { error: description }, status: status
    end
  end
end
