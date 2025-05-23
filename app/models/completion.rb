class Completion < ApplicationRecord
  # Enums
  enum status: { pending: 0, completed: 1, skipped: 2 }

  # Associations
  belongs_to :commitment

  # Status definitions
  # - pending: The completion has not been acted upon yet
  # - completed: The commitment was completed for this period
  # - skipped: The commitment was skipped for this period

  # Validations
  validates :due_date, presence: true
  validates :status, presence: true
  validates :commitment_id, uniqueness: { scope: :due_date, message: 'already has a completion for this period' }

  # Scopes
  scope :for_period, ->(date) { where(due_date: period_range(date)) }
  scope :for_commitment, ->(commitment) { where(commitment: commitment) }
  scope :completed, -> { where(status: :completed) }
  scope :pending, -> { where(status: :pending) }
  scope :skipped, -> { where(status: :skipped) }
  scope :for_current_period, -> {
    where(due_date: [
      Date.current, # Daily
      Date.current.end_of_week, # Weekly
      Date.current.end_of_month # Monthly
    ])
  }

  # Callbacks
  before_validation :set_default_status, on: :create
  after_save :update_commitment_status

  # Class Methods
  def self.period_range(date = Date.current)
    start_date = date.beginning_of_day
    end_date = date.end_of_day
    start_date..end_date
  end

  # Mark as completed
  # @return [Boolean] true if the update was successful, false otherwise
  def complete!
    return false if completed? # Already completed

    self.completed_at = Time.current
    self.status = :completed

    save
  end

  # Mark as skipped
  # @return [Boolean] true if the update was successful, false otherwise
  def skip!
    return false if skipped? # Already skipped

    self.completed_at = nil
    self.status = :skipped

    save
  end

  # Check if the completion is for the current period
  # @return [Boolean] true if this completion is for the current period
  def current_period?
    due_date == commitment.current_period_due_date
  end

  # Get a human-readable status
  # @return [String] a human-readable status
  def status_human
    return 'Not Started' if pending?
    return 'Completed' if completed?
    return 'Skipped' if skipped?
    'Unknown'
  end

  # Get the completion percentage for the commitment
  # @return [Float] the completion percentage (0.0 to 100.0)
  def completion_percentage
    return 0.0 if commitment.completions_count.zero?

    (commitment.completions.completed.count.to_f / commitment.completions_count) * 100.0
  end

  private

  def set_due_date
    self.due_date ||= Date.current
  end
end
