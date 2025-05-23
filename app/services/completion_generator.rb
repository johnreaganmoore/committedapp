# frozen_string_literal: true

class CompletionGenerator
  def self.generate_due_completions
    new.generate_due_completions
  end

  def generate_due_completions
    # Get all active commitments
    commitments = Commitment.active
    
    commitments.find_each do |commitment|
      generate_completion_for(commitment)
    end
  end

  private

  def generate_completion_for(commitment)
    due_date = case commitment.frequency
                when 'daily' then Date.current
                when 'weekly' then Date.current.beginning_of_week
                when 'monthly' then Date.current.beginning_of_month
                end

    # Skip if a completion already exists for this period
    return if commitment.completions.exists?(due_date: due_date)
    
    # Create a new pending completion
    commitment.completions.create!(
      due_date: due_date,
      status: :pending
    )
  rescue StandardError => e
    Rails.logger.error "Failed to generate completion for commitment #{commitment.id}: #{e.message}"
  end
end
