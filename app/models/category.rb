class Category < ApplicationRecord
  # Relationships
  belongs_to :user
  has_many :commitments, dependent: :destroy
  has_many :milestones, through: :commitments

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :color, presence: true

  # Include acts_as_list for ordering categories
  acts_as_list scope: :user_id
end
