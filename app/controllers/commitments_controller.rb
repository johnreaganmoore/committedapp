class CommitmentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_commitment, only: [:show, :edit, :update, :destroy]

  def index
    @commitments = current_user.commitments.includes(:category, :milestones)
  end

  def show
    @milestones = @commitment.milestones.includes(:commitments)
    @comments = @commitment.comments.top_level.includes(:user, :replies)
  end

  def new
    @commitment = current_user.commitments.build
    @categories = current_user.categories.order(:position)
    @milestones = current_user.milestones.order(:position)
  end

  def edit
    @categories = current_user.categories.order(:position)
    @milestones = current_user.milestones.order(:position)
  end

  def create
    @commitment = current_user.commitments.build(commitment_params)
    if @commitment.save
      redirect_to @commitment, notice: 'Commitment was successfully created.'
    else
      render :new
    end
  end

  def update
    if @commitment.update(commitment_params)
      redirect_to @commitment, notice: 'Commitment was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @commitment.destroy
    redirect_to commitments_path, notice: 'Commitment was successfully destroyed.'
  end

  private

  def set_commitment
    @commitment = current_user.commitments.find(params[:id])
  end

  def commitment_params
    params.require(:commitment).permit(
      :title,
      :description,
      :category_id,
      :frequency,
      :start_date,
      :end_date,
      :completed,
      milestone_ids: []
    )
  end
end
