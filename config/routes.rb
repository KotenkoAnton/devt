Rails.application.routes.draw do
  resources :maps, only: :index

  namespace :api do
    resources :maps do
      collection do
        get :fetch_map
        get :map_name_by_item_id
        post :create_connection
        post :change_item_position
        post :change_shape_position
        post :change_shape_size
      end
    end
  end
end
