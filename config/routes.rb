Rails.application.routes.draw do
  resources :ip_logs do
    collection do
      get :index
      get :fetch_page
    end
  end

  resources :custom_settings do
    collection do
      post :change
    end
  end

  resources :extended_search do
    collection do
      get :index
      get :fetch_devices
    end
  end

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
        get :fetch_items_for_pasting
        get :map_name_by_item_id
        get :check_connection_existence
        get :find_items
        get :fetch_items_for_list_view
        post :change_device_host_type_by_item_id
        post :set_monitoring
        post :add_new_inscription
        post :delete_shape
        post :add_shape
        post :delete_zone_item
        post :delete_inscription
        post :add_new_map
        post :add_map_item
        post :delete_connections_by_item_id
        post :delete_device_by_item_id
        post :add_device_and_item
        post :update_device_info
        post :mass_update_position
        post :create_connection
        post :change_item_position
        post :change_inscription_position
        post :change_shape_position
        post :change_shape_size
        post :delete_connection
      end
    end
  end
end
