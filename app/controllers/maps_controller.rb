class MapsController < ApplicationController
  private

  def load_map
    @map = Map.find_by(name: params[:map])
  end
end
