# frozen_string_literal: true

namespace :generate_completions do
  desc "Generate pending completions for all active commitments"
  task generate_due: :environment do
    Rails.logger.info "[#{Time.current}] Starting to generate due completions..."
    GenerateDailyCompletionsJob.perform_now
    Rails.logger.info "[#{Time.current}] Finished generating due completions."
  rescue StandardError => e
    Rails.logger.error "Error generating completions: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise e
  end
end
