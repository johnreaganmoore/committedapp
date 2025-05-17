class Milestone < ApplicationRecord
  # Relationships
  belongs_to :user
  has_many :commitments, through: :commitment_milestones
  has_many :commitment_milestones, dependent: :destroy
  has_many :comments, as: :commentable, dependent: :destroy

  # Validations
  validates :title, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :target_date, presence: true
  validates :status, presence: true

  # Include acts_as_list for ordering milestones
  acts_as_list scope: :user_id

  # Enum for status
  enum status: { pending: 0, in_progress: 1, completed: 2 }
end
