class ResetCommitmentsJob < ApplicationJob
  queue_as :default

  def perform
    Commitment.needs_reset.find_each do |commitment|
      commitment.reset_if_needed
    end
  end
end 