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
        get :fetch_map
        get :map_name_by_item_id
        get :check_connection_existence
        post :create_connection
        post :change_item_position
        post :change_shape_position
        post :change_shape_size
        post :delete_connection
      end
    end
  end
end
