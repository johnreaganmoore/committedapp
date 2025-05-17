class Category < ApplicationRecord
  # Relationships
  belongs_to :user
  has_many :commitments, dependent: :destroy
  has_many :comments, as: :commentable, dependent: :destroy

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }

  # Include acts_as_list for ordering categories
  acts_as_list scope: :user_id
end
