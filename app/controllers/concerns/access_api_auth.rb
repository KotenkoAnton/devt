module AccessApiAuth
  extend ActiveSupport::Concern
  included { before_action :authorize }

  private

  def authorize
    validate_token || render_unauthorized
  end

  def validate_token
    authenticate_with_http_token do |token, _options|
      ENV['ACCESS_API_TOKEN'] == token
    end
  end

  def render_unauthorized
    render json: { error: 'Unauthorized!' }, status: :unauthorized
  end
end
