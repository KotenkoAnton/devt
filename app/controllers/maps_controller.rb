class MapsController < ApplicationController
  before_action :load_map, only: :index

  private

  def load_map
    @map_name = params[:map]
  end
end
