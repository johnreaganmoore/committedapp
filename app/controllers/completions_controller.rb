# frozen_string_literal: true

class CompletionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_commitment
  before_action :set_completion, only: [:update, :destroy]

  def create
    @completion = @commitment.completions.new(completion_params)
    @completion.due_date = Date.current
    
    if @completion.save
      render json: { status: 'success', completion: @completion }
    else
      render json: { status: 'error', errors: @completion.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @completion.update(completion_params)
      render json: { status: 'success', completion: @completion }
    else
      render json: { status: 'error', errors: @completion.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @completion.destroy
    head :no_content
  end

  private

  def set_commitment
    @commitment = current_user.commitments.find(params[:commitment_id])
  end

  def set_completion
    @completion = @commitment.completions.find(params[:id])
  end

  def completion_params
    params.require(:completion).permit(:status)
  end
end
