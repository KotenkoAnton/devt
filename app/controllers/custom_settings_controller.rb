class CustomSettingsController < ApplicationController
  def change
    session[params[:setting]] = !session[params[:setting]]
  end
end
