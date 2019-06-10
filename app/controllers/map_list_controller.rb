class MapListController < ApplicationController
  def index
    @maps = []
    Map.includes(:ip_addresses).each do |map|
      @maps << { name: map.name, availability_count: map.availability_count }
    end
  end
end
