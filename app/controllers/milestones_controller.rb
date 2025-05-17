class MilestonesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_milestone, only: [:show, :edit, :update, :destroy]

  def index
    @milestones = current_user.milestones.includes(:commitments)
  end

  def show
    @commitments = @milestone.commitments.includes(:category)
    @comments = @milestone.comments.top_level.includes(:user, :replies)
  end

  def new
    @milestone = current_user.milestones.build
  end

  def edit
  end

  def create
    @milestone = current_user.milestones.build(milestone_params)
    if @milestone.save
      redirect_to milestones_path, notice: 'Milestone was successfully created.'
    else
      render :new
    end
  end

  def update
    if @milestone.update(milestone_params)
      redirect_to milestones_path, notice: 'Milestone was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @milestone.destroy
    redirect_to milestones_path, notice: 'Milestone was successfully destroyed.'
  end

  private

  def set_milestone
    @milestone = current_user.milestones.find(params[:id])
  end

  def milestone_params
    params.require(:milestone).permit(:title, :description, :target_date, :status)
  end
end
