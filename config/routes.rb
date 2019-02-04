Rails.application.routes.draw do
  resources :maps, only: :index

  namespace :api do
    resources :devices do
      collection do
        post :update_status
      end
    end
    resources :maps do
      collection do
        get :fetch_device_copy
        get :fetch_all_maps_names
        get :fetch_map
        get :fetch_item_info
        get :map_name_by_item_id
        get :check_connection_existence
        post :delete_zone_item
        post :add_new_map
        post :add_map_item
        post :delete_connections_by_item_id
        post :delete_device_by_item_id
        post :add_device_and_item
        post :update_device_info
        post :create_connection
        post :change_item_position
        post :change_shape_position
        post :change_shape_size
        post :delete_connection
      end
    end
  end
end
