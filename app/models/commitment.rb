class Commitment < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :category
  has_many :commitment_milestones, dependent: :destroy
  has_many :milestones, through: :commitment_milestones
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :completions, dependent: :destroy

  # Enum for frequency
  enum frequency: { daily: 0, weekly: 1, monthly: 2 }

  # Validations
  validates :title, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :frequency, presence: true, inclusion: { in: Commitment.frequencies.keys }
  validates :completed, inclusion: { in: [true, false] }

  # Scopes
  scope :active, -> { where(completed: false) }
  scope :for_user, ->(user) { where(user: user) }
  scope :completed, -> { where(completed: true) }
  scope :incomplete, -> { where(completed: false) }

  # Public method for displaying frequency in views
  def frequency_i18n
    if frequency.present?
      Commitment.frequencies.key(frequency).to_s.humanize
    else
      'Unknown'
    end
  end

  # Get or create today's completion
  def todays_completion
    completions.find_or_initialize_by(due_date: Date.current)
  end

  # Get the current period's completion, creating it if necessary
  def current_period_completion
    due_date = case frequency
               when 'daily' then Date.current
               when 'weekly' then Date.current.end_of_week
               when 'monthly' then Date.current.end_of_month
               end
    
    completions.find_or_initialize_by(due_date: due_date) do |c|
      c.status = :pending
    end
  end

  # Mark the current period as complete
  def complete_current_period!
    completion = current_period_completion
    completion.complete!
    
    # Update the commitment's completed status based on frequency
    update_completed_status
    
    # Return the completion object
    completion
  end
  
  # Skip the current period
  def skip_current_period!
    completion = current_period_completion
    completion.skip!
    
    # Update the commitment's completed status
    update_completed_status
    
    # Return the completion object
    completion
  end
  
  # Check if the current period is completed
  def current_period_completed?
    completion = current_period_completion
    completion.persisted? && completion.completed?
  end
  
  # Get the current period's completion status
  def current_period_status
    current_period_completion.status
  end
  
  # Get the due date for the current period
  def current_period_due_date
    case frequency
    when 'daily' then Date.current
    when 'weekly' then Date.current.end_of_week
    when 'monthly' then Date.current.end_of_month
    end
  end
  
  # Get completion streak
  # Calculate the current streak of completed periods
  def current_streak
    return 0 unless completions.completed.any?
    
    # Get all completed completions ordered by due_date desc
    completed = completions.completed.order(due_date: :desc).to_a
    
    # If no completions, return 0
    return 0 if completed.empty?
    
    # If the most recent completion is not for the current period, return 0
    return 0 unless current_period_completed?
    
    # Start with 1 for the current period
    streak = 1
    
    # Get the expected due date for the previous period
    current_due_date = completed.first.due_date
    
    # Calculate the previous period's due date based on frequency
    previous_due_date = case frequency
                        when 'daily' then current_due_date - 1.day
                        when 'weekly' then current_due_date - 1.week
                        when 'monthly' then (current_due_date - 1.month).end_of_month
                        end
    
    # Find completions in order
    completed[1..-1].each do |completion|
      # If we've gone past the expected date, break the streak
      break if completion.due_date < previous_due_date
      
      # If this completion is for the expected date, increment streak
      if completion.due_date == previous_due_date
        streak += 1
        # Update the expected previous date
        previous_due_date = case frequency
                           when 'daily' then previous_due_date - 1.day
                           when 'weekly' then previous_due_date - 1.week
                           when 'monthly' then (previous_due_date - 1.month).end_of_month
                           end
      end
    end
    
    streak
  end
  
  # Get the best streak
  def best_streak
    return 0 unless completions.completed.any?
    
    # Group completions by period and count consecutive periods
    periods = completions.completed.order(due_date: :asc).pluck(:due_date)
    
    return 0 if periods.empty?
    
    current_streak = 1
    best_streak = 1
    
    (1...periods.size).each do |i|
      # Check if this completion is one period after the previous one
      if (periods[i] - periods[i-1]).to_i <= period_days
        current_streak += 1
        best_streak = [best_streak, current_streak].max
      else
        current_streak = 1
      end
    end
    
    best_streak
  end
  
  # Calculate completion percentage based on current period status
  def completion_percentage
    case current_period_status
    when 'completed' then 100
    when 'skipped' then 0
    else 0
    end
  end
  
  private

  # Set default frequency to daily if not specified
  def set_default_frequency
    self.frequency ||= :daily
  end

  # Include acts_as_list for ordering commitments
  acts_as_list scope: :category_id
  scope :active, -> { where('end_date >= ? OR end_date IS NULL', Date.current) }
  scope :completed, -> { where(completed: true) }
  scope :incomplete, -> { where(completed: false) }
end
