class CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_category, only: [:show, :edit, :update, :destroy, :reposition]

  def index
    @categories = current_user.categories.includes(:commitments).order(:position)
  end

  def show
    @commitments = @category.commitments.active.includes(:milestones)
  end

  def new
    @category = current_user.categories.build
    render layout: 'modal' if turbo_frame_request?
  end

  def edit
    render layout: 'modal' if turbo_frame_request?
  end

  def create
    Rails.logger.info "Category params: #{category_params.inspect}"
    @category = current_user.categories.build(category_params)
    if @category.save
      if turbo_frame_request?
        render turbo_stream: turbo_stream.replace(
          "categories",
          partial: "categories/list",
          locals: { categories: current_user.categories.includes(:commitments).order(:position) }
        )
      else
        redirect_to categories_path, notice: 'Category was successfully created.'
      end
    else
      Rails.logger.error "Category validation errors: #{@category.errors.full_messages.inspect}"
      render :new, status: :unprocessable_entity, layout: turbo_frame_request? ? 'modal' : 'application'
    end
  end

  def update
    if @category.update(category_params)
      if turbo_frame_request?
        render turbo_stream: turbo_stream.replace(
          "categories",
          partial: "categories/list",
          locals: { categories: current_user.categories.includes(:commitments).order(:position) }
        )
      else
        redirect_to categories_path, notice: 'Category was successfully updated.'
      end
    else
      render :edit, status: :unprocessable_entity, layout: turbo_frame_request? ? 'modal' : 'application'
    end
  end

  def destroy
    @category.destroy
    redirect_to categories_path, notice: 'Category was successfully destroyed.'
  end

  def reposition
    @category.insert_at(params[:position].to_i)
    render turbo_stream: turbo_stream.replace(
      "categories",
      partial: "categories/list",
      locals: { categories: current_user.categories.includes(:commitments).order(:position) }
    )
  end

  private

  def set_category
    @category = current_user.categories.find(params[:id])
  end

  def category_params
    params.require(:category).permit(:name, :description, :color)
  end
end
