class CommitmentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_commitment, only: [:show, :edit, :update, :destroy]

  def index
    @commitments = current_user.commitments.includes(:category)
    @categories = current_user.categories.order(:position)
    
    # Group commitments by frequency and then by category
    @grouped_commitments = {}
    Commitment.frequencies.keys.each do |frequency|
      frequency_commitments = @commitments.where(frequency: frequency)
      @grouped_commitments[frequency] = frequency_commitments
        .group_by(&:category)
        .sort_by { |category, _| category.position }
        .to_h
        .transform_values { |commitments| commitments.sort_by(&:position) }
    end
    
    # Calculate stats for the dashboard
    @stats = {
      total_commitments: @commitments.count,
      completed_commitments: @commitments.completed.count,
      incomplete_commitments: @commitments.incomplete.count,
      best_streak: @commitments.maximum(:current_streak) || 0
    }
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
    @categories = current_user.categories.order(:position)
    @milestones = current_user.milestones.order(:position)
    if @commitment.save
      respond_to do |format|
        format.html { redirect_to @commitment, notice: 'Commitment was successfully created.' }
        format.json { render json: { status: 'success', message: 'Commitment created successfully' } }
      end
    else
      respond_to do |format|
        format.html { render :new }
        format.json { render json: { status: 'error', errors: @commitment.errors.full_messages }, status: :unprocessable_entity }
      end
    end
  end

  def update
    if @commitment.update(commitment_params)
      respond_to do |format|
        format.html { redirect_to commitments_path, notice: 'Commitment was successfully updated.' }
        format.json { render json: { success: true, completed: @commitment.completed } }
      end
    else
      respond_to do |format|
        format.html { render :edit }
        format.json { render json: { success: false }, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @commitment.destroy
    redirect_to commitments_path, notice: 'Commitment was successfully destroyed.'
  end
  
  def complete
    @commitment = current_user.commitments.find(params[:id])
    
    if @commitment.complete_current_period!
      respond_to do |format|
        format.html { redirect_to commitments_path, notice: 'Commitment marked as complete! 🎉' }
        format.json { 
          render json: { 
            status: 'success', 
            html: render_to_string(partial: 'commitments/commitment_card', locals: { commitment: @commitment }),
            completion: @commitment.current_period_completion.as_json(only: [:id, :status, :completed_at])
          } 
        }
      end
    else
      respond_to do |format|
        format.html { redirect_to commitments_path, alert: 'Failed to mark commitment as complete.' }
        format.json { 
          render json: { 
            status: 'error', 
            errors: @commitment.errors.full_messages 
          }, 
          status: :unprocessable_entity 
        }
      end
    end
  end
  
  def skip
    @commitment = current_user.commitments.find(params[:id])
    
    if @commitment.skip_current_period!
      respond_to do |format|
        format.html { redirect_to commitments_path, notice: 'Commitment skipped for this period.' }
        format.json { 
          render json: { 
            status: 'success',
            html: render_to_string(partial: 'commitments/commitment_card', locals: { commitment: @commitment }),
            completion: @commitment.current_period_completion.as_json(only: [:id, :status, :completed_at])
          }
        }
      end
    else
      respond_to do |format|
        format.html { redirect_to commitments_path, alert: 'Failed to skip commitment.' }
        format.json { 
          render json: { 
            status: 'error', 
            errors: @commitment.errors.full_messages 
          }, 
          status: :unprocessable_entity 
        }
      end
    end
  end

  private

  def set_commitment
    @commitment = if params[:commitment_id]
                  current_user.commitments.find(params[:commitment_id])
                else
                  current_user.commitments.find(params[:id])
                end
  end

  def commitment_params
    params.require(:commitment).permit(
      :title,
      :description,
      :category_id,
      :frequency,
      :start_date,
      :end_date,
      :user_id,
      :completed,
      milestone_ids: []
    )
  end
end
