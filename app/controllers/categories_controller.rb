class CategoriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_category, only: [:show, :edit, :update, :destroy]

  def index
    @categories = current_user.categories.includes(:commitments)
  end

  def show
    @commitments = @category.commitments.active.includes(:milestones)
    @comments = @category.comments.top_level.includes(:user, :replies)
  end

  def new
    @category = current_user.categories.build
  end

  def edit
  end

  def create
    Rails.logger.info "Category params: #{category_params.inspect}"
    @category = current_user.categories.build(category_params)
    if @category.save
      render json: @category, status: :created
    else
      Rails.logger.error "Category validation errors: #{@category.errors.full_messages.inspect}"
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      redirect_to categories_path, notice: 'Category was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @category.destroy
    redirect_to categories_path, notice: 'Category was successfully destroyed.'
  end

  private

  def set_category
    @category = current_user.categories.find(params[:id])
  end

  def category_params
    params.require(:category).permit(:name, :description)
  end
end
