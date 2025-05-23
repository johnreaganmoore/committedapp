class GenerateDailyCompletionsJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "Starting to generate daily completions..."
    
    # Generate completions for all active commitments
    Commitment.active.find_each do |commitment|
      begin
        # This will create a new completion if one doesn't exist for the current period
        commitment.current_period_completion
      rescue => e
        Rails.logger.error "Error generating completion for commitment #{commitment.id}: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
      end
    end
    
    Rails.logger.info "Finished generating daily completions."
  end
end
