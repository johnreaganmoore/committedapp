class HomeController < ApplicationController
  def index
    if user_signed_in?
      @commitment = current_user.commitments.build
      @categories = current_user.categories.order(:position).includes(:commitments)
      @groups = current_user.groups.includes(:users)
      @upcoming_commitments = current_user.commitments.active.order(start_date: :asc).limit(5)
    end
  end
end
