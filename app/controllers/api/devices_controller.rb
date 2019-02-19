module Api
  class DevicesController < ApplicationController
    protect_from_forgery with: :null_session
    include AccessApiAuth

    def update_status
      return err("Bad parameters", 422) unless params[:ip] && params[:status]

      ip_address = IpAddress.find_by(ip_address: params[:ip])
      return err("Record not found", 404) unless ip_address

      case params[:status]
      when "down"
        ip_address.icmp_available = false
      when "up"
        ip_address.icmp_available = true
      else
        return err("Bad parameters", 422)
      end
      ip_address.changed_status_at = Time.current
      return render json: { status: "Success" }, status: 200 if ip_address.save

      render json: { status: "Could not save the record" }, status: 200
    end

    private

    def err(description, status)
      render json: { error: description }, status: status
    end
  end
end
