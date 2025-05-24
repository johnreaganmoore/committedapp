Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Landing page for non-signed-in users
  get 'landing/index'
  root 'landing#index'

  # Authenticated routes
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }
  resources :groups
  resources :categories
  resources :milestones
  resources :commitments do
    resources :completions, only: [:create, :update, :destroy], controller: 'completions'
    
    member do
      post :complete
      post :skip
    end
  end
  get 'home/index'

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
