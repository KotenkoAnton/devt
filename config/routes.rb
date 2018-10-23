Rails.application.routes.draw do
  resources :maps, only: :index

  namespace :api do
    resources :maps do
      collection do
        get :fetch_map
        post :change_item_position
        post :change_shape_position
      end
    end
  end
end
