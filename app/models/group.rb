class Group < ApplicationRecord
  # Relationships
  belongs_to :user, foreign_key: :user_id
  has_many :group_memberships, dependent: :destroy
  has_many :users, through: :group_memberships
  has_many :comments, as: :commentable, dependent: :destroy

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :description, length: { maximum: 500 }
  validates :private, inclusion: { in: [true, false] }

  # Include acts_as_list for ordering groups
  acts_as_list scope: :user_id

  # Enum for role in group_memberships
  enum role: { member: 0, admin: 1 }
end
