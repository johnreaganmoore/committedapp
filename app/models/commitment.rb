class Commitment < ApplicationRecord
  # Relationships
  belongs_to :user
  belongs_to :category
  has_many :commitment_milestones, dependent: :destroy
  has_many :milestones, through: :commitment_milestones
  has_many :comments, as: :commentable, dependent: :destroy

  # Validations
  validates :title, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :frequency, presence: true
  validates :start_date, presence: true
  validates :end_date, presence: true
  validates :completed, inclusion: { in: [true, false] }

  # Include acts_as_list for ordering commitments
  acts_as_list scope: :category_id

  # Enum for frequency
  enum frequency: { daily: 0, weekly: 1, monthly: 2 }

  # Scope for active commitments
  scope :active, -> { where('end_date >= ?', Date.current) }
  scope :completed, -> { where(completed: true) }
  scope :incomplete, -> { where(completed: false) }
end
